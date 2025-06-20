import { AnalyticsProvider, EventProperties } from '../types'

/**
 * Google Analytics 4 Provider
 * This is a minimal stub implementation
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

    // In a real implementation, this would load the GA4 script
    console.debug('GA4 Provider initialized with:', this.measurementId)
    this.initialized = true
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized) return

    // In a real implementation, this would send the event to GA4
    console.debug('GA4 track:', eventName, properties)
  }

  page(properties?: EventProperties): void {
    if (!this.initialized) return

    // In a real implementation, this would send a page view to GA4
    console.debug('GA4 page view:', properties)
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized) return

    // In a real implementation, this would set the user ID in GA4
    console.debug('GA4 identify:', userId, traits)
  }

  reset(): void {
    // In a real implementation, this would clear the user data
    console.debug('GA4 reset')
  }
}