import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe, webhookSecret } from '@/lib/stripe/config'
import { prisma } from '@/lib/db'
import { handleStripeError } from '@/lib/stripe/utils'
import { LRUCache } from 'lru-cache'
import {
  sendOrderConfirmation,
  sendWelcomeEmail,
} from '@/lib/email/email-service'
import { AbandonedCartService } from '@/lib/abandoned-cart/service'

// Idempotency cache to prevent duplicate processing
const idempotencyCache = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
})

// Webhook event handlers
const eventHandlers: Record<string, (event: Stripe.Event) => Promise<void>> = {
  'checkout.session.completed': handleCheckoutSessionCompleted,
  'checkout.session.expired': handleCheckoutSessionExpired,
  'payment_intent.succeeded': handlePaymentIntentSucceeded,
  'payment_intent.payment_failed': handlePaymentFailed,
  'checkout.session.async_payment_succeeded': handleCheckoutSessionCompleted,
  'checkout.session.async_payment_failed': handlePaymentFailed,
}

// Retry configuration for transient failures
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries === 0) throw error

    // Check if error is retryable
    const isRetryable =
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.message?.includes('network') ||
      error.message?.includes('timeout')

    if (!isRetryable) throw error

    console.log(
      `Retrying after error: ${error.message}. Retries left: ${retries}`
    )
    await new Promise((resolve) =>
      setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1))
    )
    return retryWithBackoff(fn, retries - 1)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Check idempotency
  const eventKey = `${event.id}-${event.type}`
  if (idempotencyCache.get(eventKey)) {
    console.log(`Event ${eventKey} already processed, skipping`)
    return NextResponse.json({ received: true })
  }

  // Process event
  try {
    const handler = eventHandlers[event.type]
    if (handler) {
      await handler(event)
      // Mark as processed
      idempotencyCache.set(eventKey, true)
    } else {
      console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error)
    // Return 500 to trigger Stripe retry
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  console.log('Processing checkout.session.completed:', session.id)

  // Extract metadata
  const { businessId, utmToken } = session.metadata || {}

  if (!businessId || !utmToken) {
    console.error('Missing required metadata in session:', session.id)
    throw new Error('Missing required metadata')
  }

  // Create purchase record
  try {
    const purchase = await prisma.purchase.create({
      data: {
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent as string,
        businessId,
        utmToken,
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        customerEmail: session.customer_details?.email || null,
        status: 'completed',
        metadata: {
          customerName: session.customer_details?.name,
          paymentMethod: session.payment_method_types?.[0],
        },
      },
    })

    console.log('Purchase record created:', purchase.id)

    // Mark cart as no longer abandoned
    const abandonedCartService = new AbandonedCartService({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://anthrasite.io',
    })
    await abandonedCartService.handlePaymentSuccess(session.id)

    // Get business details for email
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business) {
      console.error('Business not found:', businessId)
      throw new Error('Business not found')
    }

    // Mark UTM token as used
    await prisma.utmToken.update({
      where: { token: utmToken },
      data: {
        used: true,
        usedAt: new Date(),
      },
    })

    // Send order confirmation email with retry
    if (session.customer_details?.email) {
      try {
        const emailResult = await retryWithBackoff(async () =>
          sendOrderConfirmation({
            to: session.customer_details!.email!,
            customerName: session.customer_details?.name || undefined,
            orderId: purchase.id,
            businessDomain: business.domain,
            amount: session.amount_total || 0,
            currency: session.currency || 'usd',
            purchaseDate: new Date(),
          })
        )

        if (emailResult.success) {
          console.log('Order confirmation email sent:', emailResult.messageId)

          // Update purchase record with email sent status
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              metadata: {
                ...(purchase.metadata as object),
                orderConfirmationSent: true,
                orderConfirmationSentAt: new Date().toISOString(),
              },
            },
          })
        } else {
          console.error(
            'Failed to send order confirmation email:',
            emailResult.error
          )

          // Queue for manual retry if needed
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              metadata: {
                ...(purchase.metadata as object),
                orderConfirmationFailed: true,
                orderConfirmationError: emailResult.error,
              },
            },
          })
        }
      } catch (error) {
        console.error(
          'Error sending order confirmation email after retries:',
          error
        )
        // Don't throw - we don't want to fail the webhook if email fails

        // Mark for manual follow-up
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            metadata: {
              ...(purchase.metadata as object),
              orderConfirmationFailed: true,
              orderConfirmationError:
                error instanceof Error ? error.message : 'Unknown error',
            },
          },
        })
      }

      // Send welcome email (if first purchase)
      try {
        const previousPurchases = await prisma.purchase.count({
          where: {
            customerEmail: session.customer_details.email,
            id: { not: purchase.id },
            status: 'completed',
          },
        })

        if (previousPurchases === 0) {
          const welcomeResult = await sendWelcomeEmail({
            to: session.customer_details.email,
            customerName: session.customer_details.name || undefined,
            businessDomain: business.domain,
          })

          if (welcomeResult.success) {
            console.log('Welcome email sent:', welcomeResult.messageId)
          } else {
            console.error('Failed to send welcome email:', welcomeResult.error)
          }
        }
      } catch (error) {
        console.error('Error sending welcome email:', error)
        // Don't throw - we don't want to fail the webhook if email fails
      }
    }

    // TODO: Trigger report generation
    // This would typically be a call to a queue or external service
    await triggerReportGeneration(purchase.id, businessId)
  } catch (error) {
    console.error('Failed to create purchase record:', error)
    throw error
  }
}

/**
 * Handle payment intent success (backup for checkout completion)
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  console.log('Processing payment_intent.succeeded:', paymentIntent.id)

  // Check if purchase already exists
  const existingPurchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (existingPurchase) {
    console.log('Purchase already exists for payment intent:', paymentIntent.id)
    return
  }

  // This is a backup handler - the checkout.session.completed should handle most cases
  console.warn(
    'Payment intent succeeded without checkout session:',
    paymentIntent.id
  )
}

/**
 * Handle payment failures
 */
async function handlePaymentFailed(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  console.log('Processing payment_intent.payment_failed:', paymentIntent.id)

  // Update purchase record if it exists
  const purchase = await prisma.purchase.findFirst({
    where: { stripePaymentIntentId: paymentIntent.id },
  })

  if (purchase) {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'failed',
        metadata: {
          ...(purchase.metadata as object),
          failureReason: paymentIntent.last_payment_error?.message,
        },
      },
    })
  }
}

/**
 * Handle checkout session expiration
 */
async function handleCheckoutSessionExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session

  console.log('Processing checkout.session.expired:', session.id)

  try {
    // Delete the abandoned cart record since it's no longer recoverable
    await prisma.abandonedCart.deleteMany({
      where: {
        stripeSessionId: session.id,
      },
    })

    console.log('Removed expired abandoned cart:', session.id)
  } catch (error) {
    console.error('Failed to handle expired session:', error)
    // Don't throw - this is cleanup, not critical
  }
}

/**
 * Stub for report generation trigger
 */
async function triggerReportGeneration(purchaseId: string, businessId: string) {
  console.log(
    `Triggering report generation for purchase ${purchaseId}, business ${businessId}`
  )

  // In production, this would:
  // 1. Send a message to a queue (SQS, Pub/Sub, etc.)
  // 2. Call an external report generation service
  // 3. Send a webhook to a report generation microservice

  // For now, just update the purchase record
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: {
      metadata: {
        reportGenerationTriggered: true,
        reportGenerationTriggeredAt: new Date().toISOString(),
      },
    },
  })
}
