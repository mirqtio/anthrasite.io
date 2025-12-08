import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics/analytics-server'
import { sendPurchaseConfirmationEmail } from '@/lib/email'
import { getTemporalClient } from '@/lib/temporal/client'

// Force dynamic rendering - prevents build-time execution
export const dynamic = 'force-dynamic'

// Lazy initialization to prevent build-time execution
let stripeInstance: Stripe | null = null
function getStripe() {
  const apiKey = process.env.STRIPE_SECRET_KEY
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2025-05-28.basil',
    })
  }
  return stripeInstance
}

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    console.warn('[Webhook] Stripe not configured - webhook disabled')
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 200 }
    )
  }

  const stripe = getStripe()
  let event: Stripe.Event

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    // Construct and verify the webhook event
    if (
      process.env.USE_MOCK_PURCHASE === 'true' &&
      request.headers.get('x-mock-signature') === 'skip'
    ) {
      // Bypass signature verification for mock mode
      const json = JSON.parse(body)
      event = json as Stripe.Event
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    }
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

        // Trigger Post-Purchase Workflow (Report Generation & Delivery)
        const leadId = session.metadata?.leadId
        if (leadId) {
          try {
            const client = await getTemporalClient()
            const runId = `purchase_${session.id}` // Unique run ID for this fulfillment

            await client.workflow.start('PostPurchaseWorkflow', {
              taskQueue: 'premium-reports',
              workflowId: `post-purchase-${leadId}-${session.id}`,
              args: [
                {
                  lead_id: parseInt(leadId, 10),
                  run_id: runId,
                  customer_email: customerEmail,
                },
              ],
            })
            console.log(
              `[Webhook] Started PostPurchaseWorkflow for lead ${leadId}, runId=${runId}`
            )

            await trackEvent('workflow_started', {
              workflow: 'PostPurchaseWorkflow',
              leadId,
              runId,
            })
          } catch (err) {
            console.error(
              '[Webhook] Failed to start PostPurchaseWorkflow:',
              err
            )
            await trackEvent('workflow_start_failed', {
              error: err instanceof Error ? err.message : 'Unknown',
              leadId,
              purchaseId: purchase.id,
            })
            // DEBUG: Return error to caller
            return NextResponse.json(
              {
                received: true,
                workflow_error:
                  err instanceof Error ? err.message : 'Unknown error',
                stack: err instanceof Error ? err.stack : undefined,
              },
              { status: 500 }
            )
          }
        } else {
          console.warn(
            '[Webhook] No leadId in session metadata, skipping workflow trigger'
          )
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Extract metadata
        const purchaseId = paymentIntent.metadata?.purchaseId
        const businessId = paymentIntent.metadata?.businessId
        const domain = paymentIntent.metadata?.domain
        const leadId = paymentIntent.metadata?.leadId

        if (!purchaseId) {
          console.error('Missing purchaseId in PaymentIntent metadata')
          break
        }

        // Find existing Purchase record (created when PaymentIntent was generated)
        const existingPurchase = await prisma.purchase.findUnique({
          where: { id: purchaseId },
          include: { business: true },
        })

        if (!existingPurchase) {
          console.error(`Purchase not found for purchaseId: ${purchaseId}`)
          break
        }

        // Update purchase to completed status
        const purchase = await prisma.purchase.update({
          where: { id: purchaseId },
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

        // Trigger Post-Purchase Workflow (Report Generation & Delivery)
        if (leadId) {
          try {
            const client = await getTemporalClient()
            const runId = `purchase_pi_${paymentIntent.id}` // Unique run ID for this fulfillment

            await client.workflow.start('PostPurchaseWorkflow', {
              taskQueue: 'premium-reports',
              workflowId: `post-purchase-${leadId}-${paymentIntent.id}`,
              args: [
                {
                  lead_id: parseInt(leadId, 10),
                  run_id: runId,
                  customer_email:
                    purchase.customerEmail || purchase.business.email || null,
                },
              ],
            })
            console.log(
              `[Webhook] Started PostPurchaseWorkflow for lead ${leadId}, runId=${runId}`
            )

            await trackEvent('workflow_started', {
              workflow: 'PostPurchaseWorkflow',
              leadId,
              runId,
            })
          } catch (err) {
            console.error(
              '[Webhook] Failed to start PostPurchaseWorkflow:',
              err
            )
            await trackEvent('workflow_start_failed', {
              error: err instanceof Error ? err.message : 'Unknown',
              leadId,
              purchaseId: purchase.id,
            })
          }
        } else {
          console.warn(
            '[Webhook] No leadId in PaymentIntent metadata, skipping workflow trigger'
          )
        }

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

    return NextResponse.json(
      {
        received: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
