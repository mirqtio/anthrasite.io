import { GoogleAnalytics4Provider } from './providers/ga4'
import { PostHogProvider } from './providers/posthog'
import { HotjarProvider } from './providers/hotjar'
import {
  AnalyticsProvider,
  EventProperties,
  AnalyticsConfig,
  ConsentStatus,
} from './types'
import { getCookieConsent, onConsentChange } from '@/lib/cookies/consent'
import { validateEventSchema } from './event-schemas'

export class AnalyticsManager {
  private providers: Map<string, AnalyticsProvider> = new Map()
  private initialized = false
  private sessionId: string
  private config: AnalyticsConfig

  constructor(config: AnalyticsConfig) {
    this.config = config
    this.sessionId = this.generateSessionId()
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    const consent = getCookieConsent()

    // Initialize providers based on consent
    if (consent.analytics) {
      await this.initializeProviders()
    }

    // Listen for consent changes
    onConsentChange((newConsent) => {
      if (newConsent.analytics && !this.initialized) {
        this.initializeProviders()
      } else if (!newConsent.analytics && this.initialized) {
        this.reset()
      }
    })

    this.initialized = true
  }

  private async initializeProviders(): Promise<void> {
    console.log('[AnalyticsManager] Initializing providers...')
    
    // Initialize GA4
    if (this.config.ga4) {
      console.log('[AnalyticsManager] Initializing GA4 with ID:', this.config.ga4.measurementId)
      const ga4 = new GoogleAnalytics4Provider(
        this.config.ga4.measurementId,
        this.config.ga4.apiSecret
      )
      await ga4.initialize()
      this.providers.set('ga4', ga4)
      console.log('[AnalyticsManager] GA4 initialized')
    }

    // Initialize PostHog
    if (this.config.posthog) {
      console.log('[AnalyticsManager] Initializing PostHog')
      const posthog = new PostHogProvider(
        this.config.posthog.apiKey,
        this.config.posthog.host
      )
      await posthog.initialize()
      this.providers.set('posthog', posthog)
      console.log('[AnalyticsManager] PostHog initialized')
    }

    // Initialize Hotjar
    if (this.config.hotjar) {
      console.log('[AnalyticsManager] Initializing Hotjar with site ID:', this.config.hotjar.siteId)
      const hotjar = new HotjarProvider(this.config.hotjar.siteId)
      await hotjar.initialize()
      this.providers.set('hotjar', hotjar)
      console.log('[AnalyticsManager] Hotjar initialized')
    }

    console.log('[AnalyticsManager] All providers initialized. Total:', this.providers.size)
    
    // Initialize Datadog RUM (already configured separately)
    // Just track that analytics is initialized
    this.track('analytics_initialized', {
      providers: Array.from(this.providers.keys()),
    })
  }

  track(eventName: string, properties?: EventProperties): void {
    // Validate event schema
    if (!validateEventSchema(eventName, properties)) {
      console.error(`Invalid event schema for ${eventName}`, properties)
      return
    }

    // Enrich properties
    const enrichedProperties = this.enrichProperties(properties)

    // Send to all providers
    this.providers.forEach((provider) => {
      try {
        provider.track(eventName, enrichedProperties)
      } catch (error) {
        console.error(
          `Failed to track event ${eventName} with provider:`,
          error
        )
      }
    })
  }

  page(properties?: EventProperties): void {
    const enrichedProperties = this.enrichProperties(properties)

    this.providers.forEach((provider) => {
      try {
        provider.page(enrichedProperties)
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    })
  }

  identify(userId: string, traits?: EventProperties): void {
    this.providers.forEach((provider) => {
      try {
        provider.identify(userId, traits)
      } catch (error) {
        console.error('Failed to identify user:', error)
      }
    })
  }

  reset(): void {
    this.providers.forEach((provider) => {
      try {
        provider.reset()
      } catch (error) {
        console.error('Failed to reset provider:', error)
      }
    })

    // Generate new session ID
    this.sessionId = this.generateSessionId()
  }

  // A/B Testing specific methods
  getFeatureFlag(flagKey: string): boolean | string | undefined {
    const posthog = this.providers.get('posthog') as PostHogProvider
    if (!posthog) return undefined

    return posthog.getFeatureFlag(flagKey)
  }

  isFeatureEnabled(flagKey: string): boolean {
    const posthog = this.providers.get('posthog') as PostHogProvider
    if (!posthog) return false

    return posthog.isFeatureEnabled(flagKey)
  }

  // Funnel tracking
  trackFunnelStep(
    funnelName: string,
    step: number,
    stepName: string,
    properties?: EventProperties
  ): void {
    this.track('funnel_step', {
      funnel_name: funnelName,
      funnel_step: step,
      step_name: stepName,
      ...properties,
    })
  }

  // E-commerce tracking
  trackPurchase(
    orderId: string,
    amount: number,
    currency: string = 'USD',
    properties?: EventProperties
  ): void {
    this.track('purchase', {
      transaction_id: orderId,
      value: amount,
      currency,
      ...properties,
    })
  }

  // Performance tracking
  trackPerformance(
    metric: string,
    value: number,
    properties?: EventProperties
  ): void {
    this.track('performance_metric', {
      metric_name: metric,
      metric_value: value,
      ...properties,
    })
  }

  // Private methods
  private enrichProperties(properties?: EventProperties): EventProperties {
    const enriched: EventProperties = {
      ...properties,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_path:
        typeof window !== 'undefined' ? window.location.pathname : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    }

    // Add experiment variants if available
    const experiments = this.getActiveExperiments()
    if (Object.keys(experiments).length > 0) {
      enriched.experiment_variants = experiments
    }

    return enriched
  }

  private getActiveExperiments(): Record<string, string> {
    // This would integrate with your A/B testing framework
    // For now, return empty object
    return {}
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
  }
}

// Singleton instance
let analyticsManager: AnalyticsManager | null = null

export function initializeAnalytics(config: AnalyticsConfig): AnalyticsManager {
  if (!analyticsManager) {
    analyticsManager = new AnalyticsManager(config)
    analyticsManager.initialize()
  }
  return analyticsManager
}

export function getAnalytics(): AnalyticsManager | null {
  return analyticsManager
}
