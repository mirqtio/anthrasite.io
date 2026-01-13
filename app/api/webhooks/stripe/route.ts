import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getStripe, webhookSecret } from '@/lib/stripe/config'
import { getAdminClient } from '@/lib/supabase/admin'
import { getTemporalClient } from '@/lib/temporal/client'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { getOrCreateCoupon, createPromotionCode } from '@/lib/stripe/referral'
import {
  getConfig,
  getReferralCodeByStripePromoId,
} from '@/lib/referral/validation'
import {
  calculateReward,
  executePayout,
  recordConversion,
  incrementRedemptionCount,
  updateCodeTracking,
} from '@/lib/referral/payout'
import { sendWebhookFailureAlert } from '@/lib/slack/alerts'

/**
 * ANT-88: Stripe Webhook Handler
 *
 * Handles checkout.session.completed events:
 * 1. Upserts sales row with status='paid'
 * 2. Triggers PostPurchaseWorkflow via Temporal
 *
 * Configured in Stripe Dashboard -> Webhooks -> checkout.session.completed
 */

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Stripe Webhook] Signature verification failed:', message)
    // Alert to Slack - signature failures are critical config issues
    await sendWebhookFailureAlert({
      error: `Signature verification failed: ${message}`,
      eventType: 'unknown (signature failed)',
    })
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    )
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await handleCheckoutCompleted(session, event.id)
      return NextResponse.json({ received: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[Stripe Webhook] Error handling checkout:', message)
      // Alert to Slack with customer details
      await sendWebhookFailureAlert({
        eventId: event.id,
        eventType: event.type,
        error: message,
        customerEmail:
          session.customer_details?.email ||
          session.customer_email ||
          undefined,
        leadId: session.metadata?.leadId,
        paymentIntentId:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
      })
      // Return 500 so Stripe retries
      return NextResponse.json(
        { error: `Failed to process checkout: ${message}` },
        { status: 500 }
      )
    }
  }

  // Acknowledge other events we don't handle
  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  eventId: string
): Promise<void> {
  const leadId = session.metadata?.leadId
  const contactId = session.metadata?.contactId
  const customerEmail =
    session.customer_details?.email || session.customer_email
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id

  console.log('[Stripe Webhook] Processing checkout.session.completed:', {
    sessionId: session.id,
    leadId,
    contactId,
    customerEmail,
    paymentIntentId,
    amountTotal: session.amount_total,
  })

  if (!leadId) {
    throw new Error('Missing leadId in session metadata')
  }

  if (!customerEmail) {
    throw new Error('Missing customer email in session')
  }

  if (!paymentIntentId) {
    throw new Error('Missing payment intent ID')
  }

  const supabase = getAdminClient()

  // 1. Find the most recent report for this lead
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('id, run_id')
    .eq('lead_id', parseInt(leadId, 10))
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (reportError || !report) {
    throw new Error(
      `No report found for lead ${leadId}: ${reportError?.message || 'not found'}`
    )
  }

  console.log('[Stripe Webhook] Found report:', {
    reportId: report.id,
    runId: report.run_id,
  })

  // 2. Insert sales row with status='paid'
  // Use payment_intent_id as idempotency key (UNIQUE constraint)
  // Include contact_id for multi-buyer tracking
  const { data: sale, error: salesError } = await supabase
    .from('sales')
    .upsert(
      {
        report_id: report.id,
        contact_id: contactId ? parseInt(contactId, 10) : null,
        stripe_payment_intent_id: paymentIntentId,
        amount_cents: session.amount_total || 0,
        currency: session.currency || 'usd',
        status: 'paid',
        customer_email: customerEmail,
        metadata: {
          session_id: session.id,
          business_id: session.metadata?.businessId,
          utm_token: session.metadata?.utmToken,
        },
      },
      {
        onConflict: 'stripe_payment_intent_id',
        ignoreDuplicates: false,
      }
    )
    .select('id')
    .single()

  if (salesError) {
    throw new Error(`Failed to upsert sales row: ${salesError.message}`)
  }

  const saleId = sale?.id
  console.log('[Stripe Webhook] Sales row upserted successfully:', { saleId })

  // Track purchase completion
  await trackEvent('purchase_complete', {
    session_id: session.id,
    lead_id: leadId,
    contact_id: contactId || undefined,
    sale_id: saleId,
    amount: session.amount_total,
    currency: session.currency || 'usd',
    payment_intent_id: paymentIntentId,
  })

  // 3. Trigger PostPurchaseWorkflow via Temporal
  // Use event ID in workflow ID for idempotency - same event = same workflow
  const temporalClient = await getTemporalClient()
  const workflowId = `post-purchase-${eventId}`

  try {
    const handle = await temporalClient.workflow.start('PostPurchaseWorkflow', {
      workflowId,
      taskQueue: 'premium-reports',
      args: [
        {
          lead_id: parseInt(leadId, 10),
          run_id: report.run_id,
          customer_email: customerEmail,
          // Multi-buyer support: pass sale_id and contact_id
          sale_id: saleId,
          contact_id: contactId ? parseInt(contactId, 10) : null,
        },
      ],
    })

    console.log('[Stripe Webhook] Started PostPurchaseWorkflow:', {
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      saleId,
      contactId,
    })
  } catch (err) {
    // Check if workflow already exists (idempotency - this is expected on retries)
    if (
      err instanceof Error &&
      err.message.includes('Workflow execution already started')
    ) {
      console.log(
        `[Stripe Webhook] Workflow ${workflowId} already exists (idempotent retry)`
      )
      // Don't return - still need to process referrals
    } else {
      throw err // Re-throw other errors
    }
  }

  // 4. Process referrals (both generation and conversion tracking)
  await processReferrals(
    session,
    parseInt(leadId, 10),
    saleId,
    paymentIntentId,
    customerEmail,
    supabase
  )
}

/**
 * Generate referral code for the purchaser and track conversions if a referral was used
 */
async function processReferrals(
  session: Stripe.Checkout.Session,
  leadId: number,
  saleId: number,
  paymentIntentId: string,
  customerEmail: string,
  supabase: ReturnType<typeof getAdminClient>
): Promise<void> {
  try {
    // A. Track conversion if a referral code was used
    await trackReferralConversion(
      session,
      leadId,
      saleId,
      customerEmail,
      supabase
    )

    // B. Generate referral code for this purchase
    await generateReferralCode(leadId, saleId, supabase)
  } catch (err) {
    // Log but don't fail the webhook - referral processing is non-critical
    console.error(
      '[Stripe Webhook] Referral processing error (non-fatal):',
      err
    )
  }
}

/**
 * Track conversion if this purchase used a referral code
 */
async function trackReferralConversion(
  session: Stripe.Checkout.Session,
  refereeLeadId: number,
  refereeSaleId: number,
  refereeEmail: string,
  supabase: ReturnType<typeof getAdminClient>
): Promise<void> {
  // Get session with discount details from Stripe
  const stripe = getStripe()
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['total_details.breakdown'],
  })

  // Check if any discounts were applied
  const discounts = fullSession.total_details?.breakdown?.discounts || []
  if (discounts.length === 0) {
    console.log(
      '[Stripe Webhook] No discounts applied, skipping conversion tracking'
    )
    return
  }

  // Find referral discount (look for our promotion codes)
  for (const discount of discounts) {
    const promoCodeId =
      typeof discount.discount?.promotion_code === 'string'
        ? discount.discount.promotion_code
        : discount.discount?.promotion_code?.id

    if (!promoCodeId) continue

    // Look up the referral code by Stripe promo ID
    const referralCode = await getReferralCodeByStripePromoId(promoCodeId)
    if (!referralCode) {
      console.log(
        `[Stripe Webhook] Promo code ${promoCodeId} is not a referral code`
      )
      continue
    }

    console.log(
      `[Stripe Webhook] Found referral conversion for code: ${referralCode.code}`
    )

    // Self-referral check
    if (referralCode.lead_id === refereeLeadId) {
      console.log('[Stripe Webhook] Self-referral blocked: same lead_id')
      await recordConversion({
        referrerCodeId: referralCode.id,
        refereeSaleId,
        refereeLeadId,
        stripePromotionCodeId: promoCodeId,
        stripeCheckoutSessionId: session.id,
        discountAppliedCents: discount.amount || 0,
        rewardEarnedCents: 0,
        rewardPaidCents: 0,
        payoutStatus: 'skipped',
        payoutError: 'self_referral',
      })
      await trackEvent('referral_self_referral_blocked', {
        code: referralCode.code,
        referee_lead_id: refereeLeadId,
        referrer_lead_id: referralCode.lead_id,
      })
      return
    }

    // Check email match for self-referral
    if (referralCode.sale_id) {
      const { data: referrerSale } = await supabase
        .from('sales')
        .select('customer_email')
        .eq('id', referralCode.sale_id)
        .single()

      if (
        referrerSale?.customer_email?.toLowerCase() ===
        refereeEmail.toLowerCase()
      ) {
        console.log('[Stripe Webhook] Self-referral blocked: same email')
        await recordConversion({
          referrerCodeId: referralCode.id,
          refereeSaleId,
          refereeLeadId,
          stripePromotionCodeId: promoCodeId,
          stripeCheckoutSessionId: session.id,
          discountAppliedCents: discount.amount || 0,
          rewardEarnedCents: 0,
          rewardPaidCents: 0,
          payoutStatus: 'skipped',
          payoutError: 'self_referral',
        })
        await trackEvent('referral_self_referral_blocked', {
          code: referralCode.code,
          referee_email: refereeEmail,
          referrer_email: referrerSale.customer_email,
        })
        return
      }
    }

    // Check if this is first conversion for this code
    const { count: existingConversions } = await supabase
      .from('referral_conversions')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_code_id', referralCode.id)
      .eq('payout_status', 'paid')

    const isFirstConversion = (existingConversions || 0) === 0

    // Calculate reward
    const reward = await calculateReward(
      referralCode,
      session.amount_total || 0,
      isFirstConversion
    )

    console.log('[Stripe Webhook] Reward calculation:', {
      code: referralCode.code,
      earnedCents: reward.earnedCents,
      payableCents: reward.payableCents,
      reason: reward.reason,
    })

    // Execute payout if applicable
    let payoutResult = null
    if (!reward.skipPayout && reward.payableCents > 0 && referralCode.sale_id) {
      // Get referrer's payment intent for refund
      const { data: referrerSale } = await supabase
        .from('sales')
        .select('stripe_payment_intent_id')
        .eq('id', referralCode.sale_id)
        .single()

      if (referrerSale?.stripe_payment_intent_id) {
        payoutResult = await executePayout(
          referralCode,
          `${referralCode.id}-${refereeSaleId}`,
          reward.payableCents,
          referrerSale.stripe_payment_intent_id
        )

        console.log('[Stripe Webhook] Payout result:', payoutResult)

        // Update code tracking counters (total_reward_paid_cents, period_reward_paid_cents, pending_payout_cents)
        if (payoutResult.amountPaidCents > 0 || payoutResult.pendingCents > 0) {
          await updateCodeTracking(
            referralCode.id,
            payoutResult.amountPaidCents,
            payoutResult.pendingCents
          )
          console.log('[Stripe Webhook] Updated code tracking:', {
            codeId: referralCode.id,
            amountPaid: payoutResult.amountPaidCents,
            pending: payoutResult.pendingCents,
          })
        }
      }
    }

    // Record conversion
    const conversionId = await recordConversion({
      referrerCodeId: referralCode.id,
      refereeSaleId,
      refereeLeadId,
      stripePromotionCodeId: promoCodeId,
      stripeCheckoutSessionId: session.id,
      discountAppliedCents: discount.amount || 0,
      rewardEarnedCents: reward.earnedCents,
      rewardPaidCents: payoutResult?.amountPaidCents || 0,
      payoutStatus: reward.skipPayout
        ? 'skipped'
        : payoutResult?.success
          ? 'paid'
          : 'failed',
      payoutMethod: payoutResult?.method || undefined,
      stripeRefundId: payoutResult?.refundId,
      payoutError:
        payoutResult?.error || (reward.skipPayout ? reward.reason : undefined),
    })

    // Increment redemption count
    await incrementRedemptionCount(referralCode.id)

    // Track analytics
    await trackEvent('referral_purchase_completed', {
      referrer_code: referralCode.code,
      referee_sale_id: refereeSaleId,
      discount_cents: discount.amount || 0,
      reward_earned_cents: reward.earnedCents,
      reward_paid_cents: payoutResult?.amountPaidCents || 0,
      payout_method: payoutResult?.method,
    })

    if (payoutResult?.amountPaidCents && payoutResult.amountPaidCents > 0) {
      await trackEvent('referral_payout_issued', {
        code: referralCode.code,
        amount_cents: payoutResult.amountPaidCents,
        method: payoutResult.method,
      })
    }

    // Only process first referral discount found
    return
  }
}

/**
 * Generate a new referral code for the purchaser
 */
async function generateReferralCode(
  leadId: number,
  saleId: number,
  supabase: ReturnType<typeof getAdminClient>
): Promise<void> {
  // Check if code already exists for this sale (idempotency)
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('id, code')
    .eq('sale_id', saleId)
    .single()

  if (existing) {
    console.log(
      `[Stripe Webhook] Referral code already exists for sale ${saleId}: ${existing.code}`
    )
    return
  }

  // Get lead company name
  const { data: lead } = await supabase
    .from('leads')
    .select('company_name')
    .eq('id', leadId)
    .single()

  const companyName = lead?.company_name || `LEAD${leadId}`

  // Get default config values
  const defaultDiscount = await getConfig(
    'default_standard_discount_cents',
    10000
  )
  const defaultReward = await getConfig('default_standard_reward_cents', 10000)

  // Generate unique code from company name
  const code = await generateUniqueCode(companyName, supabase)

  // Create Stripe coupon (or get existing)
  const couponId = await getOrCreateCoupon('fixed', defaultDiscount)

  // Create Stripe promotion code
  const { promotionCodeId } = await createPromotionCode(code, couponId)

  // Insert referral_codes row
  const { error } = await supabase.from('referral_codes').insert({
    sale_id: saleId,
    lead_id: leadId,
    code,
    stripe_promotion_code_id: promotionCodeId,
    stripe_coupon_id: couponId,
    tier: 'standard',
    is_active: true,
    discount_type: 'fixed',
    discount_amount_cents: defaultDiscount,
    reward_type: 'fixed',
    reward_amount_cents: defaultReward,
    reward_trigger: 'first',
    company_name: companyName,
  })

  if (error) {
    console.error('[Stripe Webhook] Failed to insert referral code:', error)
    throw error
  }

  console.log(
    `[Stripe Webhook] Generated referral code: ${code} for sale ${saleId}`
  )

  await trackEvent('referral_code_issued', {
    sale_id: saleId,
    code,
    tier: 'standard',
  })
}

/**
 * Generate a unique referral code from company name
 */
async function generateUniqueCode(
  baseName: string,
  supabase: ReturnType<typeof getAdminClient>
): Promise<string> {
  // Normalize: uppercase, alphanumeric only, max 12 chars
  const normalized = baseName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12)

  // If empty after normalization, use fallback
  const base = normalized || 'REFERRAL'

  for (let suffix = 0; suffix < 100; suffix++) {
    const code = suffix === 0 ? base : `${base}${suffix}`

    // Check DB for existing code
    const { data: existing } = await supabase
      .from('referral_codes')
      .select('id')
      .eq('code', code)
      .single()

    if (!existing) {
      return code
    }
  }

  // Fallback with random suffix
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${base.slice(0, 8)}${random}`
}
