import { AnalyticsProvider, EventProperties } from '../types'

declare global {
  interface Window {
    hj?: (...args: any[]) => void
    _hjSettings?: {
      hjid: number
      hjsv: number
    }
  }
}

/**
 * Hotjar Provider
 * Integrates with Hotjar for heatmaps, session recordings, and feedback
 */
export class HotjarProvider implements AnalyticsProvider {
  private siteId: string
  private initialized = false

  constructor(siteId: string) {
    this.siteId = siteId
  }

  async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return

    // Hotjar Tracking Code
    ;(function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function() {
        (h.hj.q = h.hj.q || []).push(arguments)
      }
      h._hjSettings = { hjid: parseInt(this.siteId), hjsv: 6 }
      a = o.getElementsByTagName('head')[0]
      r = o.createElement('script')
      r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')

    console.debug('Hotjar Provider initialized with site ID:', this.siteId)
    this.initialized = true
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || !window.hj) return

    // Hotjar uses virtual page views for tracking events
    // You can also use hj('trigger', eventName) for feedback polls/surveys
    window.hj('event', eventName)
    
    // For custom data, use identify
    if (properties) {
      const attributes = Object.entries(properties).reduce((acc, [key, value]) => {
        // Hotjar only accepts string values
        acc[key] = String(value)
        return acc
      }, {} as Record<string, string>)
      
      window.hj('identify', null, attributes)
    }
  }

  page(properties?: EventProperties): void {
    if (!this.initialized || !window.hj) return

    // Trigger virtual page view in Hotjar
    window.hj('vpv', properties?.path || window.location.pathname)
  }

  identify(userId: string, traits?: EventProperties): void {
    if (!this.initialized || !window.hj) return

    // Convert traits to string values (Hotjar requirement)
    const attributes = traits ? Object.entries(traits).reduce((acc, [key, value]) => {
      acc[key] = String(value)
      return acc
    }, {} as Record<string, string>) : {}

    // Identify user in Hotjar
    window.hj('identify', userId, attributes)
  }

  reset(): void {
    // Hotjar doesn't have a built-in reset function
    // Clear user identification by calling identify with null
    if (window.hj) {
      window.hj('identify', null, {})
    }
  }
}