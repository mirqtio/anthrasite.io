import Stripe from 'stripe'

// Lazy initialization of Stripe to avoid build-time issues
let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  }
  return stripeInstance
}

// For backward compatibility
export const stripe = new Proxy({} as Stripe, {
  get(target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver)
  }
})

// Webhook configuration
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Price configuration
export const REPORT_PRICE = {
  amount: 9900, // $99.00 in cents
  currency: 'usd' as const,
  productName: 'Website Audit Report',
  productDescription: 'Comprehensive 50+ page website audit report with technical SEO analysis, performance optimization roadmap, and priority-ranked action items.',
}

// URLs for Stripe checkout
export const getStripeUrls = (baseUrl: string) => ({
  successUrl: `${baseUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl: `${baseUrl}/purchase/cancel`,
  webhookUrl: `${baseUrl}/api/stripe/webhook`,
})

// Validate environment variables
export function validateStripeConfig() {
  const required = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required Stripe environment variables: ${missing.join(', ')}`)
  }
}