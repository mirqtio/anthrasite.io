import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

// Skip Sentry initialization in CI or during builds
const shouldInitSentry = 
  SENTRY_DSN && 
  !process.env.CI && 
  process.env.NODE_ENV !== 'test' &&
  process.env.VERCEL_ENV !== 'development'

if (shouldInitSentry) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_RELEASE || 'development',

    // Server-specific configuration

    // Filtering
    beforeSend(event, hint) {
      // Filter out non-critical errors
      if (event.level === 'log' || event.level === 'debug') {
        return null
      }

      // Add server context
      event.contexts = {
        ...event.contexts,
        runtime: {
          name: 'node',
          version: process.version,
        },
      }

      return event
    },
  })
}
