import { AnalyticsProvider, EventProperties } from '../types'

declare global {
  interface Window {
    posthog?: any
  }
}

/**
 * PostHog Analytics Provider
 * Integrates with PostHog for product analytics and feature flags
 */
export class PostHogProvider implements AnalyticsProvider {
  private apiKey: string
  private initialized = false
  private host: string = 'https://app.posthog.com'

  constructor(apiKey: string, host?: string) {
    this.apiKey = apiKey
    if (host) this.host = host
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    try {
      // Check if PostHog is already loaded
      if (window.posthog) {
        console.debug('PostHog already loaded')
        this.initialized = true
        return
      }

      // Load PostHog script
      await this.loadPostHogScript()
      
      // Initialize PostHog
      window.posthog.init(this.apiKey, {
        api_host: this.host,
        loaded: (posthog: any) => {
          console.log('PostHog loaded successfully')
        }
      })

      this.initialized = true
      console.log('PostHog Provider initialized with API key')
    } catch (error) {
      console.error('Error initializing PostHog:', error)
    }
  }

  private async loadPostHogScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // PostHog snippet
      !function(t:any,e:any){var o:any,n:any,p:any,r:any;e.__SV||(window.posthog=e,e._i=[],e.init=function(i:any,s:any,a:any){function g(t:any,e:any){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t:any){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      
      // Wait for PostHog to be available
      const checkInterval = setInterval(() => {
        if (window.posthog && window.posthog.__loaded) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.posthog) {
          reject(new Error('PostHog failed to load'))
        } else {
          resolve()
        }
      }, 5000)
    })
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || !window.posthog) return

    window.posthog.capture(eventName, properties)
  }

  page(properties?: EventProperties): void {
    if (!this.initialized || !window.posthog) return

    window.posthog.capture('$pageview', {
      $current_url: properties?.url || window.location.href,
      $host: window.location.host,
      $pathname: properties?.path || window.location.pathname,
      $title: properties?.title || document.title,
      ...properties
    })
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized || !window.posthog) return

    window.posthog.identify(userId, traits)
  }

  reset(): void {
    if (!window.posthog) return
    
    window.posthog.reset()
  }

  // PostHog-specific methods for feature flags
  getFeatureFlag(flagKey: string): boolean | string | undefined {
    if (!this.initialized || !window.posthog) return undefined

    return window.posthog.getFeatureFlag(flagKey)
  }

  isFeatureEnabled(flagKey: string): boolean {
    if (!this.initialized || !window.posthog) return false

    return window.posthog.isFeatureEnabled(flagKey)
  }
}