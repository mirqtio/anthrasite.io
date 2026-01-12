import { stripe, REPORT_PRICE, getStripeUrls } from './config'
import { LRUCache } from 'lru-cache'
import type Stripe from 'stripe'

// Session cache for recovery (15 minutes TTL)
const sessionCache = new LRUCache<string, Stripe.Checkout.Session>({
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes
})

export interface CreateCheckoutSessionParams {
  businessId: string
  utmToken: string
  customerEmail?: string
  baseUrl: string
  leadId?: string
  contactId?: string
  purchaseAttemptId?: string
  /** Referral code (for tracking in metadata) */
  referralCode?: string
  /** Stripe promotion code ID to apply discount */
  stripePromotionCodeId?: string
}

/**
 * Creates a Stripe checkout session for purchasing a report
 */
export async function createCheckoutSession({
  businessId,
  utmToken,
  customerEmail,
  baseUrl,
  leadId,
  contactId,
  purchaseAttemptId,
  referralCode,
  stripePromotionCodeId,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  try {
    const urls = getStripeUrls(baseUrl)

    // Build Stripe create options
    const createOptions: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: REPORT_PRICE.currency,
            product_data: {
              name: REPORT_PRICE.productName,
              description: REPORT_PRICE.productDescription,
            },
            unit_amount: REPORT_PRICE.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: urls.successUrl,
      cancel_url: urls.cancelUrl,
      customer_email: customerEmail,
      metadata: {
        businessId,
        utmToken,
        ...(leadId && { leadId }),
        ...(contactId && { contactId }),
        ...(referralCode && { referralCode }),
      },
      // Referral discount handling:
      // - If referral code provided: apply via discounts array (allow_promotion_codes must be omitted)
      // - If no referral code: allow manual promo code entry at checkout
      ...(stripePromotionCodeId
        ? {
            discounts: [{ promotion_code: stripePromotionCodeId }],
          }
        : {
            allow_promotion_codes: true,
          }),
      billing_address_collection: 'auto',
      submit_type: 'pay',
      // Expire after 24 hours
      expires_at: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    }

    // Build request options with optional idempotency key
    const requestOptions: Stripe.RequestOptions = {}
    if (purchaseAttemptId) {
      // Idempotency key prevents double-click/refresh duplicates
      requestOptions.idempotencyKey = `checkout:${purchaseAttemptId}`
    }

    const session = await stripe.checkout.sessions.create(
      createOptions,
      requestOptions
    )

    // Cache the session for recovery
    sessionCache.set(session.id, session)

    return session
  } catch (error) {
    console.error('Failed to create checkout session:', error)
    throw new Error('Failed to create checkout session')
  }
}

/**
 * Retrieves a checkout session by ID
 */
export async function retrieveSession(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    // Check cache first
    const cached = sessionCache.get(sessionId)
    if (cached) {
      return cached
    }

    // Fetch from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'customer'],
    })

    // Update cache
    sessionCache.set(sessionId, session)

    return session
  } catch (error) {
    console.error('Failed to retrieve session:', error)
    return null
  }
}

/**
 * Retrieves session with line items (for order confirmation)
 */
export async function retrieveSessionWithLineItems(
  sessionId: string
): Promise<Stripe.Checkout.Session | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'customer'],
    })

    return session
  } catch (error) {
    console.error('Failed to retrieve session with line items:', error)
    return null
  }
}

/**
 * Checks if a session has been paid
 */
export function isSessionPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === 'paid'
}

/**
 * Gets customer email from session
 */
export function getCustomerEmail(
  session: Stripe.Checkout.Session
): string | null {
  if (session.customer_details?.email) {
    return session.customer_details.email
  }

  if (typeof session.customer === 'string') {
    return null // Would need to fetch customer object
  }

  return (session.customer as Stripe.Customer)?.email || null
}
