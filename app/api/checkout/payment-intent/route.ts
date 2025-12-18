import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PRICE_TIERS, type TierKey } from '@/lib/stripe/config'
import { isPaymentElementEnabled } from '@/lib/feature-flags'
import { prisma } from '@/lib/db'

// Force dynamic rendering - prevents build-time execution
export const dynamic = 'force-dynamic'

// Lazy initialization to prevent build-time execution
let stripeInstance: Stripe | null = null
function getStripe() {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for Payment Element')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
    })
  }
  return stripeInstance
}

/**
 * Resolve tier from request body
 * Production: extract from validated UTM token (TODO: implement UTM tier extraction)
 * Development: allow tier from request body for testing
 */
function resolveTierFromRequest(body: any): TierKey | null {
  // Dev fallback (non-prod only)
  const raw = (body?.tier || '').toLowerCase()
  if (
    process.env.NODE_ENV !== 'production' &&
    (raw === 'basic' || raw === 'pro')
  ) {
    return raw as TierKey
  }

  // Production: extract from validated UTM (TODO: implement UTM tier extraction)
  // if (body?.utm && verifyUTMSignature(body.utm)) {
  //   return body.utm.tier as TierKey
  // }

  return null
}

export async function POST(request: NextRequest) {
  // Feature flag check
  if (!isPaymentElementEnabled()) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 403 })
  }

  try {
    const body = await request.json().catch(() => ({}))

    // Tier validation
    const tier = resolveTierFromRequest(body)
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const cfg = PRICE_TIERS[tier]
    const businessId = body?.businessId
    const utm = body?.utm
    const leadId = body?.leadId

    // Require leadId now instead of strictly businessId for lookup
    if (!leadId) {
      return NextResponse.json({ error: 'Missing leadId' }, { status: 400 })
    }

    const leadIdInt = parseInt(leadId.toString(), 10)
    if (isNaN(leadIdInt)) {
      return NextResponse.json(
        { error: 'Invalid leadId format' },
        { status: 400 }
      )
    }

    // Idempotency: use anon session from middleware
    const sid = request.headers.get('x-anon-session') ?? 'no-sid'

    // Step 0: Find the latest Report for this Lead
    const report = await prisma.reports.findFirst({
      where: { lead_id: leadIdInt },
      orderBy: { created_at: 'desc' },
    })

    if (!report && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'No report found for lead' },
        { status: 404 }
      )
    }

    // Dev Logic: If no report exists in dev, handle gracefully or mock?
    // User requested we use lead 3093 which has a report (ID 366).
    // So we can assume report exists if properly set up.
    if (!report) {
      // Fallback for dev-token/dev-business-123 if used with an ID that has no report
      return NextResponse.json(
        { error: 'No report found for lead ' + leadId },
        { status: 404 }
      )
    }

    // Step 1: Upsert Sale record logic
    // We check if a sale already exists for this confirmed report
    // The schema says `report_id` is unique in `sales`, meaning 1 sale per report.
    // If we want multiple attempts, we simply rely on the existing one if pending?
    // Or does the unique constraint forbid a second attempt?
    // It implies 1:1. So we MUST update the existing sale if it exists.

    const stripe = getStripe()

    // 1. Check for existing sale
    const existingSale = await prisma.sales.findUnique({
      where: { report_id: report.id },
    })

    let saleId: number = -1
    let clientSecret: string | undefined

    if (existingSale) {
      saleId = existingSale.id

      // If we already have a payment intent, verify/retrieve it?
      // Or create a new one if the old one failed/expired?
      // If `stripe_payment_intent_id` is unique, we can't overwrite it easily if we make a NEW one.
      // We should reuse the existing PI if possible.

      if (existingSale.stripe_payment_intent_id) {
        try {
          const pi = await stripe.paymentIntents.retrieve(
            existingSale.stripe_payment_intent_id
          )
          if (pi.status !== 'canceled') {
            clientSecret = pi.client_secret || undefined
            // Update amount if changed? Assume fixed for now.
          }
        } catch (e) {
          // PI invalid or lost, ignore
        }
      }
    }

    // If no usable existing PI, create new one
    if (!clientSecret) {
      // Create PI
      const paymentIntent = await stripe.paymentIntents.create({
        amount: cfg.amount,
        currency: cfg.currency,
        automatic_payment_methods: { enabled: true },
        metadata: {
          tier,
          tierName: cfg.name,
          leadId: leadId.toString(),
          reportId: report.id.toString(),
          businessId: businessId || '',
        },
      })
      clientSecret = paymentIntent.client_secret || undefined

      // Upsert Sale
      const savedSale = await prisma.sales.upsert({
        where: { report_id: report.id },
        update: {
          stripe_payment_intent_id: paymentIntent.id,
          amount_cents: cfg.amount,
          currency: cfg.currency,
          status: 'pending',
          updated_at: new Date(),
        },
        create: {
          report_id: report.id,
          stripe_payment_intent_id: paymentIntent.id,
          amount_cents: cfg.amount,
          currency: cfg.currency,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
      saleId = savedSale.id
    } else {
      // We reused existing PI, ensure sale is consistent?
      // It should be if we retrieved it.
      // saleId was set above.
    }

    if (!clientSecret) {
      throw new Error('Failed to initialize payment')
    }

    return NextResponse.json({
      clientSecret: clientSecret,
      publicMeta: {
        tier,
        amount: cfg.amount,
        currency: cfg.currency,
        purchaseId: saleId, // Returning sale ID as purchase ID
      },
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
