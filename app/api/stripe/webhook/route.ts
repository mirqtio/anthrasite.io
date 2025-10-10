import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Stripe Webhook Handler
 *
 * Handles payment_intent events from Stripe to update purchase status.
 * This is the source of truth for payment completion - NOT the return_url.
 *
 * Events handled:
 * - payment_intent.succeeded → Mark purchase as completed
 * - payment_intent.processing → Mark purchase as processing (optional)
 * - payment_intent.payment_failed → Mark purchase as failed
 * - checkout.session.completed → Legacy Checkout flow support
 */
export async function POST(request: NextRequest) {
  // Lazy-init Stripe only at request time (not at module import)
  const apiKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // If not configured (e.g., during build), return gracefully
  if (!apiKey || !webhookSecret) {
    console.warn('[Webhook] Stripe not configured - webhook disabled')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 200 }
    )
  }

  // Initialize Stripe at request time
  const stripe = new Stripe(apiKey, {
    apiVersion: '2025-05-28.basil',
  })

  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.error('[Webhook] Missing Stripe signature')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Get raw body for signature verification
    const rawBody = await request.text()

    // Verify webhook signature - CRITICAL for security
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('[Webhook] Payment succeeded:', paymentIntent.id)

        // Find purchase by Stripe payment intent ID
        const purchase = await prisma.purchase.findFirst({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
        })

        if (!purchase) {
          console.warn(
            `[Webhook] Purchase not found for payment intent: ${paymentIntent.id}`
          )
          // Return 200 to acknowledge receipt even if purchase not found
          // (prevents Stripe from retrying indefinitely)
          return NextResponse.json({
            received: true,
            warning: 'Purchase not found',
          })
        }

        // Update purchase status to completed
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'completed',
            updatedAt: new Date(),
          },
        })

        console.log(`[Webhook] Purchase ${purchase.id} marked as completed`)

        // TODO: Send confirmation email
        // TODO: Generate report
        // TODO: Mark UTM token as used

        break
      }

      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('[Webhook] Payment processing:', paymentIntent.id)

        // Optional: Track processing state for async payment methods
        await prisma.purchase.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'processing',
            updatedAt: new Date(),
          },
        })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('[Webhook] Payment failed:', paymentIntent.id)

        await prisma.purchase.updateMany({
          where: {
            stripePaymentIntentId: paymentIntent.id,
          },
          data: {
            status: 'failed',
            updatedAt: new Date(),
          },
        })

        break
      }

      case 'checkout.session.completed': {
        // Legacy support for old Checkout redirect flow
        const session = event.data.object as Stripe.Checkout.Session

        console.log('[Webhook] Checkout session completed:', session.id)

        if (session.payment_status === 'paid') {
          await prisma.purchase.updateMany({
            where: {
              stripeSessionId: session.id,
            },
            data: {
              status: 'completed',
              updatedAt: new Date(),
            },
          })
        }

        break
      }

      default:
        // Acknowledge other event types without processing
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error processing event:', error)
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    )
  }
}
