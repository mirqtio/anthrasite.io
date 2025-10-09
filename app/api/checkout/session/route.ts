import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { validateUTMToken } from '@/lib/utm/crypto'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics/analytics-server'

// Force dynamic rendering - prevents build-time execution
export const dynamic = 'force-dynamic'

// Lazy-initialize Stripe to prevent build-time errors when env var is missing
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-05-28.basil',
  })
}

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

    // Create Stripe checkout session
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Anthrasite Website Audit',
              description: `Comprehensive performance audit for ${business.domain}`,
              metadata: {
                businessId: business.id,
                domain: business.domain,
              },
            },
            unit_amount: 39900, // $399.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/purchase?utm=${utm}`,
      customer_email: business.email || undefined,
      metadata: {
        businessId: business.id,
        utm,
        domain: business.domain,
      },
      payment_intent_data: {
        metadata: {
          businessId: business.id,
          utm,
          domain: business.domain,
        },
      },
    })

    // Track checkout initiation
    await trackEvent('checkout_started', {
      businessId: business.id,
      domain: business.domain,
      price: 399,
      sessionId: session.id,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout session creation error:', error)

    // Track error
    await trackEvent('checkout_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
