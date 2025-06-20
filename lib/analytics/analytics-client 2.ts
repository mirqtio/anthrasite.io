'use client'

import { getAnalytics } from './analytics-manager'
import { EventProperties } from './types'
import { ANALYTICS_EVENTS } from './event-schemas'

// Client-side analytics functions
export function trackEvent(
  eventName: string,
  properties?: EventProperties
): void {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }

  analytics.track(eventName, properties)
}

export function trackPageView(properties?: EventProperties): void {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }

  analytics.page(properties)
}

export function identifyUser(userId: string, traits?: EventProperties): void {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }

  analytics.identify(userId, traits)
}

export function resetUser(): void {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }

  analytics.reset()
}

// Funnel tracking helpers
export function trackFunnelStep(
  funnelName: string,
  step: number,
  stepName: string,
  properties?: EventProperties
): void {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }

  analytics.trackFunnelStep(funnelName, step, stepName, properties)
}

// E-commerce tracking helpers
export function trackPurchase(
  orderId: string,
  amount: number,
  currency: string = 'USD',
  properties?: EventProperties
): void {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return
  }

  analytics.trackPurchase(orderId, amount, currency, properties)
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
    console.warn('Analytics not initialized')
    return undefined
  }

  return analytics.getFeatureFlag(flagKey)
}

export function isFeatureEnabled(flagKey: string): boolean {
  const analytics = getAnalytics()
  if (!analytics) {
    console.warn('Analytics not initialized')
    return false
  }

  return analytics.isFeatureEnabled(flagKey)
}

// Export event names for consistency
export { ANALYTICS_EVENTS }
