import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/stripe/checkout'
import { validatePurchaseToken } from '@/lib/landing/context'
import { getAdminClient } from '@/lib/supabase/admin'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { validateForCheckout } from '@/lib/referral/validation'

// Soft-gate window: 30 minutes
const SOFT_GATE_WINDOW_MS = 30 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      businessId,
      leadId,
      contactId,
      purchaseAttemptId,
      token,
      skipSoftGate,
      referralCode,
    } = body

    // DEBUG: Log incoming referral code
    console.log('[create-session] Request body:', {
      leadId,
      contactId,
      referralCode: referralCode || '(none)',
    })

    // Validate required fields
    if (!businessId || !leadId || !token) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate token
    const payload = await validatePurchaseToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Soft-gate check: look for recent purchase by this contact
    // Skip if user explicitly chose "Buy again"
    if (contactId && !skipSoftGate) {
      const supabase = getAdminClient()

      // Find the report for this lead
      const { data: report } = await supabase
        .from('reports')
        .select('id')
        .eq('lead_id', parseInt(leadId, 10))
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (report) {
        // Check for recent purchase by this contact for this report
        const windowStart = new Date(
          Date.now() - SOFT_GATE_WINDOW_MS
        ).toISOString()

        const { data: recentSale } = await supabase
          .from('sales')
          .select('id, created_at, customer_email')
          .eq('report_id', report.id)
          .eq('contact_id', parseInt(contactId, 10))
          .gte('created_at', windowStart)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (recentSale) {
          // Return soft-gate info - UI will show options
          console.log(
            `[create-session] Soft-gate: contact ${contactId} has recent purchase (sale ${recentSale.id})`
          )
          return NextResponse.json({
            recentPurchase: {
              saleId: recentSale.id,
              purchasedAt: recentSale.created_at,
              email: recentSale.customer_email,
            },
          })
        }
      }
    }

    // Validate referral code if provided
    let validatedReferral: {
      code: string
      stripePromotionCodeId: string
    } | null = null
    if (referralCode) {
      // Look up contact email for self-referral check (if contactId provided)
      let refereeEmail: string | undefined
      if (contactId) {
        const supabase = getAdminClient()
        const { data: contact } = await supabase
          .from('contacts')
          .select('email')
          .eq('id', parseInt(contactId, 10))
          .single()
        refereeEmail = contact?.email ?? undefined
      }

      const referralValidation = await validateForCheckout(
        referralCode,
        parseInt(leadId, 10),
        refereeEmail
      )

      if (!referralValidation.valid) {
        console.log(
          `[create-session] Referral code invalid: ${referralValidation.reason}`
        )
        await trackEvent('referral_code_invalid', {
          code: referralCode,
          reason: referralValidation.reason,
          lead_id: leadId,
        })
        return NextResponse.json(
          { error: `Invalid referral code: ${referralValidation.reason}` },
          { status: 400 }
        )
      }

      if (referralValidation.code?.stripe_promotion_code_id) {
        validatedReferral = {
          code: referralValidation.code.code,
          stripePromotionCodeId:
            referralValidation.code.stripe_promotion_code_id,
        }
        console.log(
          `[create-session] Referral code valid: ${validatedReferral.code}`
        )
      }
    }

    // Get base URL for redirect URLs
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const host = request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    // Create Stripe checkout session with idempotency key
    const session = await createCheckoutSession({
      businessId,
      utmToken: token,
      leadId,
      contactId,
      purchaseAttemptId,
      baseUrl,
      // Pass referral info for discount application
      referralCode: validatedReferral?.code,
      stripePromotionCodeId: validatedReferral?.stripePromotionCodeId,
    })

    // Track checkout session creation
    await trackEvent('checkout_session_created', {
      lead_id: leadId,
      contact_id: contactId,
      session_id: session.id,
      soft_gate_triggered: false,
      price: session.amount_total,
      referral_code: validatedReferral?.code,
    })

    // Return the checkout URL for redirect
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('[checkout/create-session] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
