import {
  AnalyticsProvider,
  EventProperties,
  AnalyticsConfig,
  ConsentStatus,
} from './types'
import { getCookieConsent, onConsentChange } from '@/lib/cookies/consent'
import { validateEventSchema } from './event-schemas'

// Lazy load providers to reduce initial bundle size
const loadGA4Provider = () => import('./providers/ga4').then(m => m.GoogleAnalytics4Provider)
const loadPostHogProvider = () => import('./providers/posthog').then(m => m.PostHogProvider)
const loadHotjarProvider = () => import('./providers/hotjar').then(m => m.HotjarProvider)

export class AnalyticsManager {
  private providers: Map<string, AnalyticsProvider> = new Map()
  private initialized = false
  private sessionId: string
  private config: AnalyticsConfig
  private initPromise: Promise<void> | null = null

  constructor(config: AnalyticsConfig) {
    this.config = config
    this.sessionId = this.generateSessionId()
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return
    
    // Prevent multiple initialization calls
    if (this.initPromise) return this.initPromise
    
    this.initPromise = this._initialize()
    await this.initPromise
  }

  private async _initialize(): Promise<void> {
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
    
    const initPromises: Promise<void>[] = []
    
    // Initialize GA4 lazily
    if (this.config.ga4) {
      initPromises.push(
        loadGA4Provider().then(GA4Provider => {
          const ga4 = new GA4Provider(
            this.config.ga4!.measurementId,
            this.config.ga4!.apiSecret
          )
          this.providers.set('ga4', ga4)
          return ga4.initialize()
        })
      )
    }

    // Initialize PostHog lazily
    if (this.config.posthog) {
      initPromises.push(
        loadPostHogProvider().then(PostHogProvider => {
          const posthog = new PostHogProvider(
            this.config.posthog!.apiKey,
            this.config.posthog!.host
          )
          this.providers.set('posthog', posthog)
          return posthog.initialize()
        })
      )
    }

    // Initialize Hotjar lazily
    if (this.config.hotjar) {
      initPromises.push(
        loadHotjarProvider().then(HotjarProvider => {
          const hotjar = new HotjarProvider(this.config.hotjar!.siteId)
          this.providers.set('hotjar', hotjar)
          return hotjar.initialize()
        })
      )
    }

    // Wait for all providers to initialize
    await Promise.all(initPromises)
    console.log('[AnalyticsManager] All providers initialized')
  }

  async track(
    eventName: string,
    properties?: EventProperties
  ): Promise<void> {
    if (!this.initialized) {
      console.warn('[AnalyticsManager] Not initialized, queuing event:', eventName)
      return
    }

    // Validate event schema
    const isValid = validateEventSchema(eventName, properties)
    if (!isValid) {
      console.error('[AnalyticsManager] Invalid event:', eventName, properties)
      return
    }

    // Add common properties
    const enrichedProperties = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    }

    // Track with all providers
    this.providers.forEach((provider) => {
      try {
        provider.track(eventName, enrichedProperties)
      } catch (error) {
        console.error('[AnalyticsManager] Provider error:', error)
      }
    })
  }

  page(properties?: EventProperties): void {
    if (!this.initialized) return

    const enrichedProperties = {
      ...properties,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
    }

    this.providers.forEach((provider) => {
      try {
        provider.page(enrichedProperties)
      } catch (error) {
        console.error('[AnalyticsManager] Provider error:', error)
      }
    })
  }

  identify(userId: string, traits?: EventProperties): void {
    this.providers.forEach((provider) => {
      try {
        provider.identify(userId, traits)
      } catch (error) {
        console.error('[AnalyticsManager] Failed to identify user:', error)
      }
    })
  }


  reset(): void {
    this.providers.forEach((provider) => {
      provider.reset()
    })
    this.providers.clear()
    this.initialized = false
    this.sessionId = this.generateSessionId()
  }

  // A/B Testing specific methods
  getFeatureFlag(flagKey: string): boolean | string | undefined {
    // Import type dynamically to avoid circular dependency
    const posthog = this.providers.get('posthog') as any
    if (!posthog || !posthog.getFeatureFlag) return undefined
    return posthog.getFeatureFlag(flagKey)
  }

  isFeatureEnabled(flagKey: string): boolean {
    const posthog = this.providers.get('posthog') as any
    if (!posthog || !posthog.isFeatureEnabled) return false
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

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Singleton instance with lazy initialization
let managerInstance: AnalyticsManager | null = null

export function initializeAnalytics(config: AnalyticsConfig): AnalyticsManager {
  if (!managerInstance) {
    managerInstance = new AnalyticsManager(config)
    // Don't await here - let it initialize in the background
    managerInstance.initialize().catch(console.error)
  }
  return managerInstance
}

export function getAnalytics(): AnalyticsManager | null {
  return managerInstance
}

// Export compatible methods for existing code
export async function trackEvent(eventName: string, properties?: EventProperties): Promise<void> {
  if (managerInstance) {
    return managerInstance.track(eventName, properties)
  }
}

export async function trackPageView(url: string, properties?: EventProperties): Promise<void> {
  if (managerInstance) {
    managerInstance.page({ ...properties, page_path: url })
  }
}