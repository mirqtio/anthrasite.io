import { NextResponse } from 'next/server'

export async function GET() {
  // Cannot access client-side objects in API routes
  // Return basic configuration info only
  
  const response = {
    environment: process.env.NODE_ENV,
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
    note: 'For client-side analytics status, check browser console logs after accepting consent',
  }

  return NextResponse.json(response, { status: 200 })
}