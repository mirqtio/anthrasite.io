import posthog from 'posthog-js'
import { AnalyticsProvider, EventProperties } from '../types'
import { getCookieConsent } from '@/lib/cookies/consent'

export class PostHogProvider implements AnalyticsProvider {
  private initialized = false
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    const consent = getCookieConsent()
    if (!consent.analytics) return

    posthog.init(this.apiKey, {
      api_host: 'https://app.posthog.com',
      persistence: 'localStorage+cookie',
      autocapture: false, // We'll capture events manually
      capture_pageview: false, // We'll capture page views manually
      loaded: (posthog) => {
        // Identify user if we have a distinct ID
        const distinctId = this.getDistinctId()
        if (distinctId) {
          posthog.identify(distinctId)
        }
      },
    })

    this.initialized = true
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.capture(eventName, properties)
  }

  page(properties?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.capture('$pageview', {
      $current_url: properties?.url || window.location.href,
      $pathname: properties?.path || window.location.pathname,
      $host: window.location.host,
      $referrer: document.referrer,
      ...properties,
    })
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.identify(userId, traits)
  }

  reset(): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.reset()
  }


  // A/B Testing methods
  getFeatureFlag(flagKey: string): boolean | string | undefined {
    if (!this.initialized || typeof window === 'undefined') return undefined

    return posthog.getFeatureFlag(flagKey)
  }

  isFeatureEnabled(flagKey: string): boolean {
    if (!this.initialized || typeof window === 'undefined') return false

    return posthog.isFeatureEnabled(flagKey) ?? false
  }

  onFeatureFlags(callback: () => void): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.onFeatureFlags(callback)
  }

  // Helper methods
  private getDistinctId(): string | null {
    if (typeof window === 'undefined') return null

    // Try to get from localStorage first
    const stored = localStorage.getItem('posthog_distinct_id')
    if (stored) return stored

    // Generate a new one
    const distinctId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('posthog_distinct_id', distinctId)
    return distinctId
  }

}