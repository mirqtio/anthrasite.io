// Global type definitions

interface Window {
  Sentry?: {
    captureException: (error: Error, context?: any) => void
    captureMessage: (message: string, level?: string) => void
  }
  dataLayer?: any[]
  gtag?: (command: string, ...args: any[]) => void
  posthog?: any
  hj?: (...args: any[]) => void
  _hjSettings?: {
    hjid: number
    hjsv: number
  }
  // Test-specific properties
  __testConsentAccepted?: boolean
}

// Stripe types extension
declare namespace NodeJS {
  interface ProcessEnv {
    STRIPE_SECRET_KEY: string
    STRIPE_WEBHOOK_SECRET: string
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
  }
}
