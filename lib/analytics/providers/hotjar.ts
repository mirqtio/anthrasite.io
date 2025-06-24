import { AnalyticsProvider, EventProperties } from '../types'

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

    try {
      // Check if Hotjar is already loaded
      if (window.hj) {
        console.debug('Hotjar already loaded')
        this.initialized = true
        return
      }

      // Initialize Hotjar
      const hj = function (...args: any[]) {
        const hjQueue = (hj as any).q = (hj as any).q || []
        hjQueue.push(args)
      }
      ;(hj as any).q = []
      window.hj = hj
      window._hjSettings = { hjid: parseInt(this.siteId), hjsv: 6 }

      // Create and append script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://static.hotjar.com/c/hotjar-${window._hjSettings.hjid}.js?sv=${window._hjSettings.hjsv}`

      // Add error handling
      script.onerror = () => {
        console.error('Failed to load Hotjar script')
      }

      script.onload = () => {
        console.log('Hotjar script loaded successfully')
      }

      document.head.appendChild(script)

      console.log('Hotjar Provider initialized with site ID:', this.siteId)
      this.initialized = true
    } catch (error) {
      console.error('Error initializing Hotjar:', error)
    }
  }

  track(eventName: string, properties?: EventProperties): void {
    if (!this.initialized || !window.hj) return

    // Hotjar uses virtual page views for tracking events
    // You can also use hj('trigger', eventName) for feedback polls/surveys
    window.hj('event', eventName)

    // For custom data, use identify
    if (properties) {
      const attributes = Object.entries(properties).reduce(
        (acc, [key, value]) => {
          // Hotjar only accepts string values
          acc[key] = String(value)
          return acc
        },
        {} as Record<string, string>
      )

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
    const attributes = traits
      ? Object.entries(traits).reduce(
          (acc, [key, value]) => {
            acc[key] = String(value)
            return acc
          },
          {} as Record<string, string>
        )
      : {}

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
