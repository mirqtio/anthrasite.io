import { NextResponse } from 'next/server'

export async function GET() {
  const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
  const hotjarSiteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN
  const environment = process.env.NODE_ENV

  // Check if analytics scripts would be loaded
  const response = {
    environment,
    ga4: {
      measurementId: ga4MeasurementId || 'NOT_SET',
      configured: !!ga4MeasurementId,
      expectedFormat: 'Should start with G- (e.g., G-XXXXXXXXXX)',
      valid: ga4MeasurementId ? ga4MeasurementId.startsWith('G-') : false,
    },
    hotjar: {
      siteId: hotjarSiteId || 'NOT_SET',
      configured: !!hotjarSiteId,
    },
    posthog: {
      hasKey: !!posthogKey,
      configured: !!posthogKey,
      host: posthogHost || 'https://app.posthog.com',
    },
    sentry: {
      configured: !!sentryDsn,
      dsn: sentryDsn ? 'SET (hidden)' : 'NOT_SET',
    },
    csp: {
      note: 'Check browser console for CSP violations',
      production: environment === 'production',
    },
    clientSideCheck: {
      note: 'Run this in browser console to check client-side state:',
      command: `
console.log({
  gtag: typeof window.gtag,
  dataLayer: window.dataLayer?.length || 0,
  posthog: typeof window.posthog,
  Sentry: typeof window.Sentry,
  ga4Events: window.dataLayer?.filter(d => d[0] === 'event').length || 0
})`,
    },
  }

  return NextResponse.json(response, { status: 200 })
}
