export interface EventProperties {
  [key: string]: any
  // Common properties
  value?: number
  currency?: string
  transaction_id?: string
  session_id?: string
  experiment_variants?: Record<string, string>
  page_path?: string
  page_title?: string
  referrer?: string
}

export interface AnalyticsProvider {
  initialize(): Promise<void>
  track(eventName: string, properties?: EventProperties): void
  page(properties?: EventProperties): void
  identify(userId: string, traits?: EventProperties): void
  reset(): void
}

export interface ServerAnalyticsProvider extends AnalyticsProvider {
  trackServer(eventName: string, properties: EventProperties): Promise<void>
}

export interface ConsentStatus {
  analytics: boolean
  marketing: boolean
  performance: boolean
}

export interface AnalyticsConfig {
  ga4?: {
    measurementId: string
    apiSecret?: string
  }
  posthog?: {
    apiKey: string
  }
  datadog?: {
    applicationId: string
    clientToken: string
  }
}
