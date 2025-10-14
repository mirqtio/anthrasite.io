import type { RumInitConfiguration } from '@datadog/browser-rum'

export const initDatadog = async () => {
  // Only run in browser
  if (typeof window === 'undefined') {
    return
  }

  // Skip if already initialized (check SDK's internal state)
  if ((window as any).DD_RUM?.getInternalContext) {
    return
  }

  // Skip in E2E tests to reduce noise and improve stability
  if (
    process.env.NEXT_PUBLIC_E2E === 'true' ||
    process.env.NEXT_PUBLIC_E2E_TESTING === 'true'
  ) {
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  const site = (process.env.NEXT_PUBLIC_DATADOG_SITE ||
    'datadoghq.com') as RumInitConfiguration['site']
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'

  if (!applicationId || !clientToken) {
    console.warn('Datadog RUM not initialized: missing configuration')
    return
  }

  // Dynamic imports to prevent loading during SSR/build
  const [{ datadogRum }, { datadogLogs }] = await Promise.all([
    import('@datadog/browser-rum'),
    import('@datadog/browser-logs'),
  ])

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

    beforeSend: (event) => {
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

    beforeSend: () => {
      // Log is sent as-is
      return true
    },
  })

  // Start RUM session
  datadogRum.startSessionReplayRecording()
}

// Custom logging functions
export const logInfo = async (
  message: string,
  context?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return
  const { datadogLogs } = await import('@datadog/browser-logs')
  datadogLogs.logger.info(message, context)
}

export const logWarning = async (
  message: string,
  context?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return
  const { datadogLogs } = await import('@datadog/browser-logs')
  datadogLogs.logger.warn(message, context)
}

export const logError = async (
  message: string,
  error?: Error,
  context?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return
  const { datadogLogs } = await import('@datadog/browser-logs')
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
export const measurePerformance = async (
  name: string,
  fn: () => void | Promise<void>
) => {
  if (typeof window === 'undefined') return fn()

  const startTime = performance.now()

  const complete = async () => {
    const duration = performance.now() - startTime
    const { datadogRum } = await import('@datadog/browser-rum')
    datadogRum.addTiming(name, duration)
  }

  try {
    const result = fn()
    if (result instanceof Promise) {
      return result.finally(complete)
    }
    await complete()
    return result
  } catch (error) {
    await complete()
    throw error
  }
}

// User tracking
export const setDatadogUser = async (user: {
  id: string
  email?: string
  name?: string
}) => {
  if (typeof window === 'undefined') return
  const { datadogRum } = await import('@datadog/browser-rum')
  datadogRum.setUser({
    id: user.id,
    email: user.email,
    name: user.name,
  })
}

// Custom actions
export const trackAction = async (
  name: string,
  context?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return
  const { datadogRum } = await import('@datadog/browser-rum')
  datadogRum.addAction(name, context)
}

// Feature flags
export const trackFeatureFlag = async (name: string, value: boolean) => {
  if (typeof window === 'undefined') return
  const { datadogRum } = await import('@datadog/browser-rum')
  datadogRum.addFeatureFlagEvaluation(name, value)
}
