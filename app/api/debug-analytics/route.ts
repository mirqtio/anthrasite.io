import { NextResponse } from 'next/server'

export async function GET() {
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const hotjarSiteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const environment = process.env.NODE_ENV

  // Check if analytics scripts would be loaded
  const response = {
    environment,
    ga4: {
      measurementId: ga4MeasurementId || 'NOT_SET',
      configured: !!ga4MeasurementId,
    },
    hotjar: {
      siteId: hotjarSiteId || 'NOT_SET',
      configured: !!hotjarSiteId,
    },
    posthog: {
      hasKey: !!posthogKey,
      configured: !!posthogKey,
    },
    csp: {
      note: 'Check browser console for CSP violations',
      production: environment === 'production',
    },
  }

  return NextResponse.json(response, { status: 200 })
}