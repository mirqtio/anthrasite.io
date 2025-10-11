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
        },
      })

      this.initialized = true
      console.log('PostHog Provider initialized with API key')
    } catch (error) {
      console.error('Error initializing PostHog:', error)
    }
  }

  private async loadPostHogScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Create script element
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.async = true
      script.src = `${this.host}/static/array.js`

      // Initialize PostHog before script loads
      const posthog = window.posthog || []
      window.posthog = posthog
      posthog._i = posthog._i || []

      // Define all PostHog methods as stubs that queue calls
      const methods = [
        'capture',
        'identify',
        'alias',
        'people.set',
        'people.set_once',
        'set_config',
        'register',
        'register_once',
        'unregister',
        'opt_out_capturing',
        'has_opted_out_capturing',
        'opt_in_capturing',
        'reset',
        'isFeatureEnabled',
        'onFeatureFlags',
        'getFeatureFlag',
        'getFeatureFlagPayload',
        'reloadFeatureFlags',
        'group',
        'updateEarlyAccessFeatureEnrollment',
        'getEarlyAccessFeatures',
        'getActiveMatchingSurveys',
        'getSurveys',
      ]

      methods.forEach((method) => {
        const parts = method.split('.')
        let obj = posthog as any

        if (parts.length === 2) {
          obj[parts[0]] = obj[parts[0]] || {}
          obj = obj[parts[0]]
          const methodName = parts[1]
          obj[methodName] = function (...args: any[]) {
            posthog.push([method].concat(args))
          }
        } else {
          obj[method] = function (...args: any[]) {
            posthog.push([method].concat(args))
          }
        }
      })

      // Add init method
      posthog.init = function (apiKey: string, config: any, name?: string) {
        posthog._i.push([apiKey, config, name])
      }

      // Add toString methods
      posthog.toString = function (addStub?: boolean) {
        let str = 'posthog'
        if (addStub) str += ' (stub)'
        return str
      }

      posthog.people = posthog.people || {}
      posthog.people.toString = function () {
        return posthog.toString(1) + '.people (stub)'
      }

      // Set version
      posthog.__SV = 1

      script.onload = () => {
        console.log('PostHog script loaded')
        resolve()
      }

      script.onerror = () => {
        console.error('Failed to load PostHog script')
        reject(new Error('PostHog script failed to load'))
      }

      // Insert script
      const firstScript = document.getElementsByTagName('script')[0]
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript)
      } else {
        document.head.appendChild(script)
      }
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
      ...properties,
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
