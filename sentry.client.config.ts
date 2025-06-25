import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Release tracking
    release: process.env.NEXT_PUBLIC_RELEASE || 'development',

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration(),
    ],

    // Filtering
    beforeSend(event, hint) {
      // Filter out non-critical errors in development
      if (process.env.NODE_ENV === 'development') {
        if (event.level === 'log' || event.level === 'debug') {
          return null
        }
      }

      // Don't send events for certain errors
      const error = hint.originalException
      if (error && error instanceof Error) {
        // Filter out network errors that are expected
        if (error.message?.includes('NetworkError')) {
          return null
        }
      }

      return event
    },
  })
}
