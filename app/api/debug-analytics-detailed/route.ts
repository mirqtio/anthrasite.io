import { NextResponse } from 'next/server'
import { getAnalytics } from '@/lib/analytics/analytics-manager'
import { getCookieConsent } from '@/lib/cookies/consent'

export async function GET() {
  const consent = getCookieConsent()
  const analytics = getAnalytics()
  
  // Check window objects for analytics libraries
  const checkWindowObjects = () => {
    if (typeof window === 'undefined') {
      return {
        gtag: 'Server-side - window not available',
        dataLayer: 'Server-side - window not available',
        hj: 'Server-side - window not available',
        posthog: 'Server-side - window not available',
      }
    }
    
    return {
      gtag: typeof (window as any).gtag !== 'undefined' ? 'Loaded' : 'Not loaded',
      dataLayer: Array.isArray((window as any).dataLayer) ? `Array with ${(window as any).dataLayer.length} items` : 'Not found',
      hj: typeof (window as any).hj !== 'undefined' ? 'Loaded' : 'Not loaded',
      posthog: typeof (window as any).posthog !== 'undefined' ? 'Loaded' : 'Not loaded',
    }
  }

  const response = {
    environment: process.env.NODE_ENV,
    consent: {
      analytics: consent.analytics,
      functional: consent.functional,
      performance: consent.performance,
    },
    envVars: {
      ga4: {
        measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'NOT_SET',
        hasApiSecret: !!process.env.GA4_API_SECRET,
      },
      hotjar: {
        siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID || 'NOT_SET',
      },
      posthog: {
        hasKey: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'NOT_SET',
      },
      sentry: {
        hasDsn: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
      },
      datadog: {
        hasApplicationId: !!process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
        hasClientToken: !!process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      },
    },
    analyticsManager: {
      initialized: !!analytics,
      providers: analytics ? (analytics as any).providers?.size || 0 : 0,
    },
    windowObjects: checkWindowObjects(),
    note: 'Visit this endpoint in the browser to see client-side window objects',
  }

  return NextResponse.json(response, { status: 200 })
}