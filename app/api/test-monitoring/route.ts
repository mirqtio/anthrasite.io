import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getAnalytics } from '@/lib/analytics/analytics-manager'
import { captureError, trackEvent } from '@/lib/monitoring'

export async function GET() {
  const results = {
    sentry: false,
    analytics: false,
    datadog: false,
    timestamp: new Date().toISOString()
  }

  try {
    // Test Sentry
    try {
      Sentry.captureMessage('Test message from monitoring API', 'info')
      Sentry.captureException(new Error('Test error from monitoring API'))
      results.sentry = true
    } catch (e) {
      console.error('Sentry test failed:', e)
    }

    // Test Analytics (GA4 & PostHog)
    try {
      const analytics = getAnalytics()
      if (analytics) {
        analytics.track('test_monitoring_api', {
          test: true,
          source: 'api'
        })
        results.analytics = true
      }
    } catch (e) {
      console.error('Analytics test failed:', e)
    }

    // Test Datadog via monitoring wrapper
    try {
      trackEvent('test_monitoring_api', { test: true })
      captureError(new Error('Test error for Datadog'), { source: 'api' })
      results.datadog = true
    } catch (e) {
      console.error('Datadog test failed:', e)
    }

    return NextResponse.json({
      success: true,
      results,
      environment: {
        sentry_dsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
        ga4_id: !!process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
        posthog_key: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
        datadog_app_id: !!process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
        datadog_client_token: !!process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      results 
    }, { status: 500 })
  }
}