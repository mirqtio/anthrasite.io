import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics/analytics-server'
// ARCHIVED: SendGrid provider removed in G3
// import { sendEmail } from '@/lib/email/sendgrid'
// TODO (D3): Import Gmail SMTP provider
// import { sendPurchaseConfirmation } from '@/lib/email/gmail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    // Construct and verify the webhook event
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
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

        // Create purchase record
        const purchase = await prisma.purchase.create({
          data: {
            businessId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent as string,
            amount: session.amount_total!, // Amount in cents
            currency: session.currency!,
            status: 'completed',
            utmToken: utm,
          },
        })

        // Business record already linked via purchase.businessId
        // No need to update business - purchase status tracked in Purchase model

        // Track successful purchase
        await trackEvent('purchase_completed', {
          businessId,
          domain,
          purchaseId: purchase.id,
          amount: purchase.amount,
          utm,
        })

        // TODO (D3): Send confirmation email via Gmail SMTP
        // const business = await prisma.business.findUnique({
        //   where: { id: businessId },
        // })
        //
        // if (business?.email) {
        //   await sendPurchaseConfirmation({
        //     to: business.email,
        //     businessName: business.name,
        //     domain: business.domain,
        //     purchaseId: purchase.id,
        //     amount: purchase.amount,
        //   })
        // }

        console.log('Purchase confirmation email disabled - implement Gmail SMTP in D3')

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