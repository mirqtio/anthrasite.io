import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { sendPurchaseConfirmationEmail } from '@/lib/email'

// Force dynamic rendering - prevents build-time execution
export const dynamic = 'force-dynamic'

// Lazy initialization to prevent build-time execution
let stripeInstance: Stripe | null = null
function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    })
  }
  return stripeInstance
}

export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    // Construct and verify the webhook event
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Handle the event based on type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Extract metadata
        const businessId = session.metadata?.businessId
        const utm = session.metadata?.utm
        const domain = session.metadata?.domain

        if (!businessId) {
          console.error('Missing businessId in session metadata')
          break
        }

        // Extract customer email from Stripe session
        // Priority: customer_details.email > customer_email > business.email (fallback)
        let customerEmail =
          session.customer_details?.email || session.customer_email || null

        // If no email from Stripe, fallback to business email with warning
        if (!customerEmail) {
          const business = await prisma.business.findUnique({
            where: { id: businessId },
            select: { email: true },
          })

          if (business?.email) {
            customerEmail = business.email
            console.warn(
              JSON.stringify({
                event: 'customer_email_fallback_to_business',
                purchaseId: 'pending',
                businessId,
                reason: 'No customer_email in Stripe session',
              })
            )
          }
        }

        // Create purchase record with customer email
        const purchase = await prisma.purchase.create({
          data: {
            businessId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total!, // Amount in cents
            currency: session.currency!,
            status: 'completed',
            utmToken: utm,
            customerEmail,
          },
          include: {
            business: true,
          },
        })

        // Track successful purchase
        await trackEvent('purchase_completed', {
          businessId,
          domain,
          purchaseId: purchase.id,
          amount: purchase.amount,
          utm,
        })

        // Send confirmation email (awaited for reliability in Vercel Node runtime)
        await sendPurchaseConfirmationEmail(purchase, { eventId: event.id })

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Extract metadata
        const purchaseUid = paymentIntent.metadata?.purchaseUid
        const businessId = paymentIntent.metadata?.businessId
        const domain = paymentIntent.metadata?.domain

        if (!purchaseUid) {
          console.error('Missing purchaseUid in PaymentIntent metadata')
          break
        }

        // Find existing Purchase record (created when PaymentIntent was generated)
        const existingPurchase = await prisma.purchase.findUnique({
          where: { id: purchaseUid },
          include: { business: true },
        })

        if (!existingPurchase) {
          console.error(`Purchase not found for purchaseUid: ${purchaseUid}`)
          break
        }

        // Update purchase to completed status
        const purchase = await prisma.purchase.update({
          where: { id: purchaseUid },
          data: {
            status: 'completed',
          },
          include: {
            business: true,
          },
        })

        // Track successful purchase
        await trackEvent('purchase_completed', {
          businessId,
          domain,
          purchaseId: purchase.id,
          amount: purchase.amount,
          paymentIntentId: paymentIntent.id,
        })

        // Send confirmation email (D3 implementation with idempotency)
        await sendPurchaseConfirmationEmail(purchase, { eventId: event.id })

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const businessId = paymentIntent.metadata?.businessId
        if (businessId) {
          // Track failed payment
          await trackEvent('payment_failed', {
            businessId,
            domain: paymentIntent.metadata?.domain,
            error: paymentIntent.last_payment_error?.message,
          })

          // Update purchase record if exists
          const purchase = await prisma.purchase.findFirst({
            where: {
              stripePaymentIntentId: paymentIntent.id,
            },
          })

          if (purchase) {
            await prisma.purchase.update({
              where: { id: purchase.id },
              data: {
                status: 'failed',
                metadata: {
                  failureReason: paymentIntent.last_payment_error?.message,
                },
              },
            })
          }
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        // Find and update purchase record
        const purchase = await prisma.purchase.findFirst({
          where: {
            stripePaymentIntentId: paymentIntentId,
          },
        })

        if (purchase) {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'refunded',
              metadata: {
                refundedAt: new Date().toISOString(),
                refundAmount: charge.amount_refunded,
              },
            },
          })

          // Track refund
          await trackEvent('purchase_refunded', {
            businessId: purchase.businessId,
            purchaseId: purchase.id,
            refundAmount: charge.amount_refunded / 100,
          })
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)

    // Return success to avoid Stripe retries for processing errors
    // Log the error for monitoring
    await trackEvent('webhook_error', {
      eventType: event.type,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json({ received: true })
  }
}
