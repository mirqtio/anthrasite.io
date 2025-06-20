import { AnalyticsProvider, EventProperties } from '../types'
import { getCookieConsent } from '@/lib/cookies/consent'

export class GoogleAnalytics4Provider implements AnalyticsProvider {
  private initialized = false
  private measurementId: string
  private apiSecret?: string

  constructor(measurementId: string, apiSecret?: string) {
    this.measurementId = measurementId
    this.apiSecret = apiSecret
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    const consent = getCookieConsent()
    if (!consent.analytics) return

    // Load GA4 script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`
    document.head.appendChild(script)

    // Initialize dataLayer and gtag
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments)
    }

    window.gtag('js', new Date())
    window.gtag('config', this.measurementId, {
      send_page_view: false, // We'll send page views manually
      cookie_flags: 'SameSite=None;Secure',
    })

    this.initialized = true
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined' || !window.gtag)
      return

    // Map to GA4 event structure
    const ga4Properties = this.mapToGA4Properties(properties)

    window.gtag('event', eventName, ga4Properties)
  }

  page(properties?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined' || !window.gtag)
      return

    window.gtag('event', 'page_view', {
      page_path: properties?.path || window.location.pathname,
      page_title: properties?.title || document.title,
      page_location: properties?.url || window.location.href,
      ...properties,
    })
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized || typeof window === 'undefined' || !window.gtag)
      return

    window.gtag('set', {
      user_id: userId,
      user_properties: traits,
    })
  }

  reset(): void {
    if (!this.initialized || typeof window === 'undefined' || !window.gtag)
      return

    // Clear user ID
    window.gtag('set', { user_id: null })
  }

  // Server-side tracking using Measurement Protocol
  async trackServer(
    eventName: string,
    properties: EventProperties & { client_id: string }
  ): Promise<void> {
    if (!this.apiSecret) {
      console.warn(
        'GA4 API secret not provided, cannot track server-side events'
      )
      return
    }

    const payload = {
      client_id: properties.client_id,
      events: [
        {
          name: eventName,
          params: this.mapToGA4Properties(properties),
        },
      ],
    }

    try {
      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        console.error('GA4 server tracking failed:', response.statusText)
      }
    } catch (error) {
      console.error('GA4 server tracking error:', error)
    }
  }

  private mapToGA4Properties(
    properties?: EventProperties
  ): Record<string, any> {
    if (!properties) return {}

    const mapped: Record<string, any> = {}

    // Map common e-commerce properties
    if ('value' in properties) mapped.value = properties.value
    if ('currency' in properties) mapped.currency = properties.currency || 'USD'
    if ('transaction_id' in properties)
      mapped.transaction_id = properties.transaction_id

    // Map custom properties
    Object.entries(properties).forEach(([key, value]) => {
      // GA4 has limits on property names and values
      const sanitizedKey = key
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .substring(0, 40)

      if (typeof value === 'string' && value.length > 100) {
        mapped[sanitizedKey] = value.substring(0, 100)
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        mapped[sanitizedKey] = value
      } else if (value !== null && value !== undefined) {
        mapped[sanitizedKey] = String(value)
      }
    })

    return mapped
  }
}
