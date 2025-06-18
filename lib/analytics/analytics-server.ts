import { EventProperties } from './types'
import { ANALYTICS_EVENTS } from './event-schemas'
import { cookies } from 'next/headers'

// Server-side analytics functions
export async function trackEvent(
  eventName: string,
  properties?: EventProperties
): Promise<void> {
  try {
    const cookieStore = await cookies()

    // Get client ID from cookies or generate new one
    const clientId =
      cookieStore.get('_ga_client_id')?.value || generateClientId()

    // Get distinct ID for PostHog
    const distinctId = cookieStore.get('posthog_distinct_id')?.value || clientId

    // Track to GA4 via Measurement Protocol
    if (
      process.env.GA4_API_SECRET &&
      process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    ) {
      const ga4Payload = {
        client_id: clientId,
        events: [
          {
            name: eventName,
            params: properties || {},
          },
        ],
      }

      await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
        {
          method: 'POST',
          body: JSON.stringify(ga4Payload),
        }
      )
    }

    // Track to PostHog via API
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      const PostHog = (await import('posthog-node')).PostHog
      const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: 'https://app.posthog.com',
      })

      posthog.capture({
        distinctId: distinctId,
        event: eventName,
        properties: properties || {},
      })

      await posthog.shutdown()
    }
  } catch (error) {
    console.error('Server-side analytics error:', error)
  }
}

// Funnel tracking
export async function trackFunnelStep(
  funnelName: string,
  step: number,
  stepName: string,
  properties?: EventProperties
): Promise<void> {
  await trackEvent(ANALYTICS_EVENTS.FUNNEL_STEP, {
    funnel_name: funnelName,
    funnel_step: step,
    step_name: stepName,
    ...properties,
  })
}

// E-commerce tracking
export async function trackPurchase(
  orderId: string,
  amount: number,
  currency: string = 'USD',
  properties?: EventProperties
): Promise<void> {
  await trackEvent(ANALYTICS_EVENTS.PURCHASE, {
    transaction_id: orderId,
    value: amount,
    currency,
    ...properties,
  })
}

// Email tracking
export async function trackEmailSent(
  emailType: string,
  recipient: string,
  success: boolean,
  properties?: EventProperties
): Promise<void> {
  await trackEvent(ANALYTICS_EVENTS.EMAIL_SENT, {
    email_type: emailType,
    recipient,
    success,
    ...properties,
  })
}

// Error tracking
export async function trackError(
  errorType: string,
  errorMessage: string,
  properties?: EventProperties
): Promise<void> {
  await trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...properties,
  })
}

// Helper to generate client ID
function generateClientId(): string {
  return `${Date.now()}.${Math.random().toString(36).substring(2, 15)}`
}

// Export event names for consistency
export { ANALYTICS_EVENTS }

// Alias for backward compatibility with tests
export { trackEvent as trackServerEvent }
