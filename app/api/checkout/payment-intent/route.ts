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

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 })
    }

    // Idempotency: use anon session from middleware
    const sid = request.headers.get('x-anon-session') ?? 'no-sid'
    const idemKey = `purchase:${tier}:${sid}`

    // Step 1: Create Purchase record with pending status
    // Using upsert for idempotency - if purchase already exists with this session, return existing
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        businessId,
        status: 'pending',
        metadata: {
          path: ['sessionId'],
          equals: sid,
        },
      },
    })

    let purchase
    if (existingPurchase) {
      purchase = existingPurchase
    } else {
      purchase = await prisma.purchase.create({
        data: {
          businessId,
          amount: cfg.amount,
          currency: cfg.currency,
          status: 'pending',
          utmToken: utm,
          metadata: {
            tier,
            tierName: cfg.name,
            sessionId: sid,
            leadId,
          },
        },
      })
    }

    // Step 2: Create Stripe PaymentIntent with idempotency key
    // Always use real Stripe - no mocking at this layer
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: cfg.amount,
        currency: cfg.currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          tier,
          tierName: cfg.name,
          purchaseId: purchase.id,
          businessId,
          domain: body?.domain,
          leadId,
        },
      },
      {
        // Use purchase ID for idempotency - ensures retry safety
        idempotencyKey: `pi:${purchase.id}`,
      }
    )

    // Step 3: Update Purchase record with stripePaymentIntentId
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publicMeta: {
        tier,
        amount: cfg.amount,
        currency: cfg.currency,
        purchaseId: purchase.id,
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
