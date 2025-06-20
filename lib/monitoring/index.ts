// Temporarily disable Sentry while fixing site
// import * as Sentry from '@sentry/nextjs'
import { initDatadog, logError as ddLogError, trackAction } from './datadog'

// Initialize monitoring services
export const initMonitoring = () => {
  // Initialize Datadog
  if (typeof window !== 'undefined') {
    initDatadog()
  }

  // Sentry is initialized automatically via config files
}

// Error tracking
export const captureError = (error: Error, context?: Record<string, any>) => {
  // Temporarily log to console instead of Sentry
  console.error('Error captured:', error, context)

  // Send to Datadog
  if (typeof window !== 'undefined') {
    ddLogError(error.message, error, context)
  }
}

// Custom error boundary - temporary fallback
export const ErrorBoundary = ({ children, fallback }: any) => children

// Performance monitoring
export const startTransaction = (name: string, op: string = 'navigation') => {
  return {
    setStatus: (status: string) => {},
    setData: (key: string, value: any) => {},
    finish: () => {},
    startChild: (options: any) => ({
      setStatus: (status: string) => {},
      finish: () => {},
    }),
  }
}

// User identification
export const identifyUser = (user: {
  id: string
  email?: string
  name?: string
}) => {
  // Temporarily log instead of Sentry
  console.log('User identified:', user.id)

  // Datadog
  if (typeof window !== 'undefined') {
    const { setDatadogUser } = require('./datadog')
    setDatadogUser(user)
  }
}

// Clear user on logout
export const clearUser = () => {
  console.log('User cleared')
  // Datadog clears automatically on session end
}

// Custom events
export const trackEvent = (name: string, data?: Record<string, any>) => {
  // Temporarily log instead of Sentry
  console.log('Event tracked:', name, data)

  // Datadog action
  if (typeof window !== 'undefined') {
    trackAction(name, data)
  }
}

// Alert monitoring for critical paths
export enum AlertType {
  PAYMENT_FAILED = 'payment.failed',
  EMAIL_FAILED = 'email.failed',
  UTM_VALIDATION_FAILED = 'utm.validation.failed',
  DATABASE_CONNECTION_FAILED = 'database.connection.failed',
  EXTERNAL_API_FAILED = 'external.api.failed',
}

export const sendAlert = (type: AlertType, details: Record<string, any>) => {
  const alertData = {
    alert_type: type,
    timestamp: new Date().toISOString(),
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    ...details,
  }

  // Critical alerts go to Sentry as warnings
  Sentry.captureMessage(`Alert: ${type}`, {
    level: 'warning',
    contexts: {
      alert: alertData,
    },
  })

  // Also track in Datadog
  if (typeof window !== 'undefined') {
    trackAction('alert.triggered', alertData)
  }
}

// API response time monitoring
export const monitorApiCall = async <T>(
  name: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  const transaction = startTransaction(`api.${name}`, 'http.client')
  const span = transaction.startChild({
    op: 'http.client',
    description: name,
  })

  const startTime = Date.now()

  try {
    const result = await apiCall()

    span.setStatus('ok')
    trackEvent('api.success', {
      endpoint: name,
      duration: Date.now() - startTime,
    })

    return result
  } catch (error) {
    span.setStatus('internal_error')

    captureError(error as Error, {
      api_endpoint: name,
      duration: Date.now() - startTime,
    })

    trackEvent('api.error', {
      endpoint: name,
      error: (error as Error).message,
      duration: Date.now() - startTime,
    })

    throw error
  } finally {
    span.finish()
    transaction.finish()
  }
}

// Database query monitoring
export const monitorDbQuery = async <T>(
  queryName: string,
  query: () => Promise<T>
): Promise<T> => {
  const startTime = Date.now()

  try {
    const result = await query()

    // Log slow queries
    const duration = Date.now() - startTime
    if (duration > 1000) {
      trackEvent('db.slow_query', {
        query: queryName,
        duration,
      })
    }

    return result
  } catch (error) {
    captureError(error as Error, {
      query: queryName,
      type: 'database_error',
    })
    throw error
  }
}

// Feature flag monitoring
export const checkFeatureFlag = (
  flagName: string,
  defaultValue: boolean = false
): boolean => {
  // This would integrate with your feature flag service
  // For now, using environment variables
  const value =
    process.env[`NEXT_PUBLIC_FF_${flagName.toUpperCase()}`] === 'true' ||
    defaultValue

  // Track feature flag evaluation
  trackEvent('feature_flag.evaluated', {
    flag: flagName,
    value,
  })

  return value
}
