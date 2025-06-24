import { AnalyticsProvider, EventProperties } from '../types'

/**
 * Google Analytics 4 Provider
 * Integrates with Google Analytics 4 using gtag.js
 */
export class GoogleAnalytics4Provider implements AnalyticsProvider {
  private measurementId: string
  private apiSecret?: string
  private initialized = false

  constructor(measurementId: string, apiSecret?: string) {
    this.measurementId = measurementId
    this.apiSecret = apiSecret
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    // Wait for gtag to be available (loaded by Analytics component)
    await this.waitForGtag()
    
    console.debug('GA4 Provider initialized with:', this.measurementId)
    this.initialized = true
  }

  private async waitForGtag(timeout = 5000): Promise<void> {
    const startTime = Date.now()
    
    while (!window.gtag) {
      if (Date.now() - startTime > timeout) {
        console.warn('Timeout waiting for gtag to load')
        return
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || !window.gtag) return

    // Send custom event to GA4
    window.gtag('event', eventName, {
      ...properties,
      event_category: properties?.category || 'engagement',
      send_to: this.measurementId,
    })
  }

  page(properties?: EventProperties): void {
    if (!this.initialized || !window.gtag) return

    // Send page view to GA4
    window.gtag('event', 'page_view', {
      page_path: properties?.path || window.location.pathname,
      page_title: properties?.title || document.title,
      page_location: properties?.url || window.location.href,
      send_to: this.measurementId,
    })
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized || !window.gtag) return

    // Set user ID in GA4
    window.gtag('config', this.measurementId, {
      user_id: userId,
      user_properties: traits,
    })
  }

  reset(): void {
    if (!window.gtag) return
    
    // Clear user data by resetting the user_id
    window.gtag('config', this.measurementId, {
      user_id: null,
    })
  }
}