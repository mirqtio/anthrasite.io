'use client'

import { useState, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { 
  captureError, 
  trackEvent, 
  sendAlert, 
  AlertType,
  initMonitoring 
} from '@/lib/monitoring'
import { 
  trackAction, 
  logInfo, 
  logWarning, 
  logError,
  measurePerformance,
  trackFeatureFlag
} from '@/lib/monitoring/datadog'
import { 
  trackEvent as trackAnalyticsEvent,
  trackPageView,
  identifyUser,
  trackFunnelStep,
  trackPurchase,
  trackWebVitals
} from '@/lib/analytics/analytics-client'

export default function MonitoringTestPage() {
  const [results, setResults] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Initialize monitoring on mount
    initMonitoring()
  }, [])

  const addResult = (service: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setResults(prev => ({
      ...prev,
      [service]: { status, message, details, timestamp: new Date().toISOString() }
    }))
  }

  const setServiceLoading = (service: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [service]: isLoading }))
  }

  // Sentry Tests
  const testSentryError = () => {
    setServiceLoading('sentry-error', true)
    try {
      throw new Error('Test Sentry Error - This is a test error from monitoring test page')
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: true,
          source: 'monitoring-test-page'
        }
      })
      captureError(error as Error, { test: true, source: 'monitoring-test' })
      addResult('sentry-error', 'success', 'Error sent to Sentry', { 
        error: (error as Error).message,
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Configured' : 'Not configured'
      })
    }
    setServiceLoading('sentry-error', false)
  }

  const testSentryMessage = () => {
    setServiceLoading('sentry-message', true)
    Sentry.captureMessage('Test Sentry Message - Monitoring test', 'info')
    addResult('sentry-message', 'success', 'Message sent to Sentry')
    setServiceLoading('sentry-message', false)
  }

  const testSentryBreadcrumb = () => {
    setServiceLoading('sentry-breadcrumb', true)
    Sentry.addBreadcrumb({
      message: 'Test breadcrumb from monitoring page',
      category: 'test',
      level: 'info',
      data: { test: true }
    })
    addResult('sentry-breadcrumb', 'success', 'Breadcrumb added to Sentry')
    setServiceLoading('sentry-breadcrumb', false)
  }

  const testSentryUser = () => {
    setServiceLoading('sentry-user', true)
    const testUser = {
      id: 'test-user-123',
      email: 'test@example.com',
      username: 'Test User'
    }
    Sentry.setUser(testUser)
    identifyUser(testUser.id, { email: testUser.email, name: testUser.username })
    addResult('sentry-user', 'success', 'User context set in Sentry', testUser)
    setServiceLoading('sentry-user', false)
  }

  // Google Analytics Tests
  const testGA4PageView = () => {
    setServiceLoading('ga4-pageview', true)
    trackPageView({
      path: '/test-monitoring',
      title: 'Monitoring Test Page',
      test: true
    })
    addResult('ga4-pageview', 'success', 'Page view tracked in GA4', {
      measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'Not configured'
    })
    setServiceLoading('ga4-pageview', false)
  }

  const testGA4Event = () => {
    setServiceLoading('ga4-event', true)
    trackAnalyticsEvent('test_monitoring_event', {
      category: 'test',
      action: 'click',
      label: 'monitoring test',
      value: 123
    })
    addResult('ga4-event', 'success', 'Event tracked in GA4')
    setServiceLoading('ga4-event', false)
  }

  const testGA4Funnel = () => {
    setServiceLoading('ga4-funnel', true)
    trackFunnelStep('test_funnel', 1, 'Test Step 1', { test: true })
    addResult('ga4-funnel', 'success', 'Funnel step tracked in GA4')
    setServiceLoading('ga4-funnel', false)
  }

  const testGA4Purchase = () => {
    setServiceLoading('ga4-purchase', true)
    trackPurchase('test-order-123', 99.99, 'USD', {
      items: [{ name: 'Test Product', quantity: 1 }]
    })
    addResult('ga4-purchase', 'success', 'Purchase tracked in GA4')
    setServiceLoading('ga4-purchase', false)
  }

  // PostHog Tests
  const testPostHogEvent = () => {
    setServiceLoading('posthog-event', true)
    trackAnalyticsEvent('posthog_test_event', {
      source: 'monitoring-test',
      timestamp: new Date().toISOString()
    })
    addResult('posthog-event', 'success', 'Event tracked in PostHog', {
      apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'Configured' : 'Not configured'
    })
    setServiceLoading('posthog-event', false)
  }

  const testPostHogFeatureFlag = () => {
    setServiceLoading('posthog-flag', true)
    // This would normally check a real feature flag
    const flagValue = Math.random() > 0.5
    trackFeatureFlag('test_feature', flagValue)
    addResult('posthog-flag', 'success', 'Feature flag tracked in PostHog', { 
      flag: 'test_feature', 
      value: flagValue 
    })
    setServiceLoading('posthog-flag', false)
  }

  // Datadog Tests
  const testDatadogLog = () => {
    setServiceLoading('datadog-log', true)
    logInfo('Test info log from monitoring page', { test: true })
    logWarning('Test warning log from monitoring page', { test: true })
    logError('Test error log from monitoring page', new Error('Test error'), { test: true })
    addResult('datadog-log', 'success', 'Logs sent to Datadog', {
      applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || 'Not configured',
      clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ? 'Configured' : 'Not configured'
    })
    setServiceLoading('datadog-log', false)
  }

  const testDatadogAction = () => {
    setServiceLoading('datadog-action', true)
    trackAction('test_monitoring_action', {
      source: 'monitoring-test',
      timestamp: new Date().toISOString()
    })
    addResult('datadog-action', 'success', 'Action tracked in Datadog')
    setServiceLoading('datadog-action', false)
  }

  const testDatadogPerformance = async () => {
    setServiceLoading('datadog-performance', true)
    const duration = await measurePerformance('test_performance_metric', async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100))
    })
    addResult('datadog-performance', 'success', 'Performance metric sent to Datadog', {
      metric: 'test_performance_metric',
      duration: '~100ms'
    })
    setServiceLoading('datadog-performance', false)
  }

  // Integration Tests
  const testCriticalAlert = () => {
    setServiceLoading('critical-alert', true)
    sendAlert(AlertType.EXTERNAL_API_FAILED, {
      api: 'test-api',
      error: 'Test critical alert',
      test: true
    })
    addResult('critical-alert', 'success', 'Critical alert sent to all services')
    setServiceLoading('critical-alert', false)
  }

  const testWebVitals = () => {
    setServiceLoading('web-vitals', true)
    trackWebVitals({
      CLS: 0.1,
      FID: 100,
      FCP: 1000,
      LCP: 2500,
      TTFB: 500,
      INP: 200
    })
    addResult('web-vitals', 'success', 'Web Vitals tracked')
    setServiceLoading('web-vitals', false)
  }

  const testAllServices = async () => {
    // Run all tests sequentially
    testSentryError()
    await new Promise(r => setTimeout(r, 500))
    
    testGA4Event()
    await new Promise(r => setTimeout(r, 500))
    
    testPostHogEvent()
    await new Promise(r => setTimeout(r, 500))
    
    testDatadogLog()
    await new Promise(r => setTimeout(r, 500))
    
    testCriticalAlert()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓'
      case 'error': return '✗'
      case 'info': return 'ℹ'
      default: return '?'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Monitoring Services Test Page</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This page tests all monitoring services. Check your monitoring dashboards to verify events are being received.
          </p>
        </div>

        <div className="mb-8">
          <button
            onClick={testAllServices}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run All Tests
          </button>
        </div>

        <div className="grid gap-8">
          {/* Sentry Tests */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sentry Error Tracking</h2>
            <div className="grid gap-3">
              <button
                onClick={testSentryError}
                disabled={loading['sentry-error']}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading['sentry-error'] ? 'Testing...' : 'Test Error Capture'}
              </button>
              <button
                onClick={testSentryMessage}
                disabled={loading['sentry-message']}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading['sentry-message'] ? 'Testing...' : 'Test Message Capture'}
              </button>
              <button
                onClick={testSentryBreadcrumb}
                disabled={loading['sentry-breadcrumb']}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading['sentry-breadcrumb'] ? 'Testing...' : 'Test Breadcrumb'}
              </button>
              <button
                onClick={testSentryUser}
                disabled={loading['sentry-user']}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {loading['sentry-user'] ? 'Testing...' : 'Test User Context'}
              </button>
            </div>
          </section>

          {/* Google Analytics Tests */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Analytics 4</h2>
            <div className="grid gap-3">
              <button
                onClick={testGA4PageView}
                disabled={loading['ga4-pageview']}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading['ga4-pageview'] ? 'Testing...' : 'Test Page View'}
              </button>
              <button
                onClick={testGA4Event}
                disabled={loading['ga4-event']}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading['ga4-event'] ? 'Testing...' : 'Test Custom Event'}
              </button>
              <button
                onClick={testGA4Funnel}
                disabled={loading['ga4-funnel']}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading['ga4-funnel'] ? 'Testing...' : 'Test Funnel Step'}
              </button>
              <button
                onClick={testGA4Purchase}
                disabled={loading['ga4-purchase']}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {loading['ga4-purchase'] ? 'Testing...' : 'Test Purchase Event'}
              </button>
            </div>
          </section>

          {/* PostHog Tests */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">PostHog Analytics</h2>
            <div className="grid gap-3">
              <button
                onClick={testPostHogEvent}
                disabled={loading['posthog-event']}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading['posthog-event'] ? 'Testing...' : 'Test Event'}
              </button>
              <button
                onClick={testPostHogFeatureFlag}
                disabled={loading['posthog-flag']}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading['posthog-flag'] ? 'Testing...' : 'Test Feature Flag'}
              </button>
            </div>
          </section>

          {/* Datadog Tests */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Datadog RUM & Logs</h2>
            <div className="grid gap-3">
              <button
                onClick={testDatadogLog}
                disabled={loading['datadog-log']}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading['datadog-log'] ? 'Testing...' : 'Test Logs (Info/Warn/Error)'}
              </button>
              <button
                onClick={testDatadogAction}
                disabled={loading['datadog-action']}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading['datadog-action'] ? 'Testing...' : 'Test Custom Action'}
              </button>
              <button
                onClick={testDatadogPerformance}
                disabled={loading['datadog-performance']}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading['datadog-performance'] ? 'Testing...' : 'Test Performance Metric'}
              </button>
            </div>
          </section>

          {/* Integration Tests */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Tests</h2>
            <div className="grid gap-3">
              <button
                onClick={testCriticalAlert}
                disabled={loading['critical-alert']}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading['critical-alert'] ? 'Testing...' : 'Test Critical Alert (All Services)'}
              </button>
              <button
                onClick={testWebVitals}
                disabled={loading['web-vitals']}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading['web-vitals'] ? 'Testing...' : 'Test Web Vitals'}
              </button>
            </div>
          </section>
        </div>

        {/* Results Section */}
        {Object.keys(results).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-3">
              {Object.entries(results).map(([key, result]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className={`text-lg mr-2 ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{key}</h3>
                      <p className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.message}
                      </p>
                      {result.details && (
                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Status */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Configuration</h2>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Sentry DSN:</span>
              <span className={process.env.NEXT_PUBLIC_SENTRY_DSN ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">GA4 Measurement ID:</span>
              <span className={process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">PostHog API Key:</span>
              <span className={process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Datadog Application ID:</span>
              <span className={process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Datadog Client Token:</span>
              <span className={process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Environment:</span>
              <span className="text-blue-600">
                {process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}