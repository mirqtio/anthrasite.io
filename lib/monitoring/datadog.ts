import { datadogRum, type RumInitConfiguration } from '@datadog/browser-rum'
import { datadogLogs } from '@datadog/browser-logs'

export const initDatadog = () => {
  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  const site = (process.env.NEXT_PUBLIC_DATADOG_SITE || 'datadoghq.com') as RumInitConfiguration['site']
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
  
  if (!applicationId || !clientToken) {
    console.warn('Datadog RUM not initialized: missing configuration')
    return
  }
  
  // Initialize RUM
  datadogRum.init({
    applicationId,
    clientToken,
    site,
    service: 'anthrasite.io',
    env: process.env.NODE_ENV === 'production' ? 'prod' : env,
    version: process.env.NEXT_PUBLIC_RELEASE || '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
    
    beforeSend: (event, context) => {
      // Add custom context
      if (event.type === 'error') {
        event.context = {
          ...event.context,
          error: {
            ...(event.context?.error || {}),
            source: 'client',
          },
        }
      }
      return true
    },
  })
  
  // Initialize Logs
  datadogLogs.init({
    clientToken,
    site,
    service: 'anthrasite-web',
    env,
    version: process.env.NEXT_PUBLIC_RELEASE || '1.0.0',
    forwardErrorsToLogs: true,
    forwardConsoleLogs: ['error', 'warn'],
    forwardReports: ['intervention', 'deprecation', 'csp_violation'],
    sessionSampleRate: 100,
    
    beforeSend: (log, context) => {
      // Log is sent as-is
      return true
    },
  })
  
  // Start RUM session
  datadogRum.startSessionReplayRecording()
}

// Custom logging functions
export const logInfo = (message: string, context?: Record<string, any>) => {
  datadogLogs.logger.info(message, context)
}

export const logWarning = (message: string, context?: Record<string, any>) => {
  datadogLogs.logger.warn(message, context)
}

export const logError = (message: string, error?: Error, context?: Record<string, any>) => {
  datadogLogs.logger.error(message, {
    ...context,
    error: {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    },
  })
}

// Performance monitoring helpers
export const measurePerformance = (name: string, fn: () => void | Promise<void>) => {
  const startTime = performance.now()
  
  const complete = () => {
    const duration = performance.now() - startTime
    datadogRum.addTiming(name, duration)
  }
  
  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.finally(complete)
    }
    complete()
    return result
  } catch (error) {
    complete()
    throw error
  }
}

// User tracking
export const setDatadogUser = (user: { id: string; email?: string; name?: string }) => {
  datadogRum.setUser({
    id: user.id,
    email: user.email,
    name: user.name,
  })
}

// Custom actions
export const trackAction = (name: string, context?: Record<string, any>) => {
  datadogRum.addAction(name, context)
}

// Feature flags
export const trackFeatureFlag = (name: string, value: boolean) => {
  datadogRum.addFeatureFlagEvaluation(name, value)
}