import Stripe from 'stripe'

/**
 * Stripe-specific error handling
 */
export function handleStripeError(error: unknown): {
  message: string
  code?: string
  type?: string
} {
  if (error instanceof Stripe.errors.StripeError) {
    return {
      message: error.message,
      code: error.code,
      type: error.type,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'An unexpected error occurred',
  }
}

/**
 * User-friendly error messages for common Stripe errors
 */
export function getStripeErrorMessage(error: unknown): string {
  const { code, type } = handleStripeError(error)

  // Card errors
  if (type === 'card_error') {
    switch (code) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.'
      case 'insufficient_funds':
        return 'Your card has insufficient funds. Please try a different payment method.'
      case 'expired_card':
        return 'Your card has expired. Please use a different card.'
      case 'incorrect_cvc':
        return "Your card's security code is incorrect. Please check and try again."
      default:
        return 'There was an issue with your card. Please try a different payment method.'
    }
  }

  // API errors
  if (type === 'api_error') {
    return "We're experiencing technical difficulties. Please try again later."
  }

  // Validation errors
  if (type === 'validation_error') {
    return 'Please check your payment information and try again.'
  }

  return 'An unexpected error occurred. Please try again or contact support.'
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

/**
 * Type guards for webhook events
 */
export function isCheckoutSession(
  object: any
): object is Stripe.Checkout.Session {
  return object.object === 'checkout.session'
}

export function isPaymentIntent(object: any): object is Stripe.PaymentIntent {
  return object.object === 'payment_intent'
}

export function isCustomer(object: any): object is Stripe.Customer {
  return object.object === 'customer'
}

/**
 * Extract business ID from metadata safely
 */
export function extractBusinessId(
  metadata?: Stripe.Metadata | null
): string | null {
  return metadata?.businessId || null
}

/**
 * Extract UTM token from metadata safely
 */
export function extractUtmToken(
  metadata?: Stripe.Metadata | null
): string | null {
  return metadata?.utmToken || null
}

/**
 * Retry configuration for Stripe operations
 */
export const STRIPE_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  backoffFactor: 2,
}

/**
 * Retry a Stripe operation with exponential backoff
 */
export async function retryStripeOperation<T>(
  operation: () => Promise<T>,
  config = STRIPE_RETRY_CONFIG
): Promise<T> {
  let lastError: unknown
  let delay = config.initialDelay

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === config.maxRetries) {
        break
      }

      // Don't retry certain errors
      if (error instanceof Stripe.errors.StripeError) {
        const nonRetryableTypes = [
          'card_error',
          'validation_error',
          'invalid_request_error',
        ]
        if (nonRetryableTypes.includes(error.type)) {
          throw error
        }
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * config.backoffFactor, config.maxDelay)
    }
  }

  throw lastError
}
