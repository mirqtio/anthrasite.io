'use client'

import { getAnalytics } from './analytics-manager-optimized'
import { EventProperties } from './types'
import { ANALYTICS_EVENTS } from './event-schemas'

// Client-side analytics functions
export function trackEvent(
  eventName: string,
  properties?: EventProperties
): void {
  const analytics = getAnalytics()
  if (analytics) {
    analytics.track(eventName, properties)
    return
  }

  // Fall back to gtag if AnalyticsManager not initialized
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
    return
  }
}

export function trackPageView(properties?: EventProperties): void {
  const analytics = getAnalytics()
  if (analytics) {
    analytics.page(properties)
    return
  }

  // Fall back to gtag if AnalyticsManager not initialized
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', properties)
  }
}

export function identifyUser(userId: string, traits?: EventProperties): void {
  const analytics = getAnalytics()
  if (analytics) {
    analytics.identify(userId, traits)
    return
  }

  // Fall back to gtag user_id
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: userId, ...traits })
  }
}

export function resetUser(): void {
  const analytics = getAnalytics()
  if (analytics) {
    analytics.reset()
  }
  // No gtag equivalent for reset
}

// Funnel tracking helpers
export function trackFunnelStep(
  funnelName: string,
  step: number,
  stepName: string,
  properties?: EventProperties
): void {
  const analytics = getAnalytics()
  if (analytics) {
    analytics.trackFunnelStep(funnelName, step, stepName, properties)
    return
  }

  // Fall back to gtag
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'funnel_step', {
      funnel_name: funnelName,
      funnel_step: step,
      step_name: stepName,
      ...properties,
    })
  }
}

// E-commerce tracking helpers
export function trackPurchase(
  orderId: string,
  amount: number,
  currency: string = 'USD',
  properties?: EventProperties
): void {
  const analytics = getAnalytics()
  if (analytics) {
    analytics.trackPurchase(orderId, amount, currency, properties)
    return
  }

  // Fall back to gtag purchase event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId,
      value: amount,
      currency,
      ...properties,
    })
  }
}

// Performance tracking helpers
export function trackWebVitals(metrics: {
  CLS?: number
  FID?: number
  FCP?: number
  LCP?: number
  TTFB?: number
  INP?: number
}): void {
  Object.entries(metrics).forEach(([metric, value]) => {
    if (value !== undefined) {
      trackEvent(ANALYTICS_EVENTS.WEB_VITALS, {
        metric_name: metric,
        metric_value: value,
      })
    }
  })
}

// A/B testing helpers
export function getFeatureFlag(flagKey: string): boolean | string | undefined {
  const analytics = getAnalytics()
  if (!analytics) {
    return undefined
  }

  return analytics.getFeatureFlag(flagKey)
}

export function isFeatureEnabled(flagKey: string): boolean {
  const analytics = getAnalytics()
  if (!analytics) {
    return false
  }

  return analytics.isFeatureEnabled(flagKey)
}

// Export event names for consistency
export { ANALYTICS_EVENTS }
