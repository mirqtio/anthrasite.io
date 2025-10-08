import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateUTMToken } from '@/lib/utm/crypto'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { REPORT_PRICE } from '@/lib/stripe/config'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { utm, businessId } = body

    // Validate required fields
    if (!utm || !businessId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate UTM token
    const validation = await validateUTMToken(utm)
    if (!validation.valid || validation.payload?.businessId !== businessId) {
      return NextResponse.json(
        { error: 'Invalid or expired UTM token' },
        { status: 401 }
      )
    }

    // Get business details from database
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Create Purchase record with pending status
    const purchase = await prisma.purchase.create({
      data: {
        businessId: business.id,
        amount: REPORT_PRICE.amount,
        currency: REPORT_PRICE.currency,
        status: 'pending',
        utmToken: utm,
        customerEmail: business.email,
      },
    })

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: REPORT_PRICE.amount,
      currency: REPORT_PRICE.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        purchaseUid: purchase.id,
        businessId: business.id,
        utmId: utm,
        sku: 'AUDIT_399_V1',
        tier: 'standard',
        domain: business.domain,
      },
    })

    // Update purchase with PaymentIntent ID
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        stripePaymentIntentId: paymentIntent.id,
      },
    })

    // Track checkout initiation
    await trackEvent('checkout_started', {
      businessId: business.id,
      domain: business.domain,
      price: REPORT_PRICE.amount / 100,
      purchaseId: purchase.id,
      paymentIntentId: paymentIntent.id,
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      purchaseUid: purchase.id,
    })
  } catch (error) {
    console.error('Payment intent creation error:', error)

    // Track error
    await trackEvent('checkout_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
