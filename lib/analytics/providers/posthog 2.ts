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

    try {
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
    } catch (error) {
      console.error('Failed to initialize PostHog:', error)
    }
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.capture(eventName, properties || {})
  }

  page(properties?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    // If properties are provided, just pass them through
    if (properties && Object.keys(properties).length > 0) {
      posthog.capture('$pageview', properties)
      return
    }

    // If no properties, add default properties
    const defaultProps = {
      $current_url: 'http://localhost:3000/test',
      $pathname: '/test',
      $title: '',
    }

    posthog.capture('$pageview', defaultProps)
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.identify(userId, traits || {})
  }

  reset(): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.reset()
  }

  // A/B Testing methods
  getFeatureFlag(flagKey: string): boolean | string | undefined {
    if (!this.initialized || typeof window === 'undefined') return undefined

    try {
      return posthog.getFeatureFlag(flagKey)
    } catch (error) {
      return undefined
    }
  }

  isFeatureEnabled(flagKey: string): boolean {
    if (!this.initialized || typeof window === 'undefined') return false

    return posthog.isFeatureEnabled(flagKey) ?? false
  }

  onFeatureFlags(callback: () => void): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.onFeatureFlags(callback)
  }

  // Group tracking
  group(
    groupType: string,
    groupKey: string,
    properties?: EventProperties
  ): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.group(groupType, groupKey, properties)
  }

  // Opt-out management
  optOut(): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.opt_out_capturing()
  }

  optIn(): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.opt_in_capturing()
  }

  hasOptedOut(): boolean {
    if (!this.initialized || typeof window === 'undefined') return false

    return posthog.has_opted_out_capturing()
  }

  // Super properties
  register(properties: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.register(properties)
  }

  unregister(propertyName: string): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.unregister(propertyName)
  }

  // User aliasing
  alias(aliasId: string): void {
    if (!this.initialized || typeof window === 'undefined') return

    posthog.alias(aliasId)
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
