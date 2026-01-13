'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackPageView } from '@/lib/analytics/analytics-client'
import { useWebVitals } from '@/lib/analytics/hooks/useWebVitals'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Check if running in E2E mode
  const isE2E =
    process.env.NEXT_PUBLIC_E2E === 'true' ||
    process.env.NEXT_PUBLIC_E2E_TESTING === 'true'

  // Track Web Vitals
  useWebVitals()

  // Load GA4 and Google Ads immediately on mount
  useEffect(() => {
    // Skip in E2E mode or when analytics is disabled
    if (isE2E) return
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return

    // Check if script is already loaded
    if (document.querySelector('script[src*="googletagmanager.com"]')) {
      return
    }

    const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    if (!measurementId) {
      console.error('GA4 Measurement ID is not defined')
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    script.async = true
    script.onload = () => {
      console.log('[GA4] Script loaded successfully')

      // Initialize gtag after script loads
      window.dataLayer = window.dataLayer || []
      // Define gtag function - IMPORTANT: must use arguments, not spread operator
      // eslint-disable-next-line prefer-rest-params
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments)
      }

      // Initialize GA4
      window.gtag('js', new Date())
      window.gtag('config', measurementId, {
        page_path: window.location.pathname,
        send_page_view: true,
      })
      console.log('[GA4] Initialized with measurement ID:', measurementId)

      // Also configure Google Ads for conversion tracking
      const adsConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID
      if (adsConversionId) {
        window.gtag('config', adsConversionId)
        console.log(
          '[GoogleAds] Configured with conversion ID:',
          adsConversionId
        )
      }
    }
    script.onerror = () => {
      console.error('[GA4] Failed to load script')
    }
    document.head.appendChild(script)
  }, [isE2E])

  // Track page views on route change
  useEffect(() => {
    if (isE2E) return
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'true') return

    if (pathname && window.gtag) {
      const url =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')

      trackPageView({
        path: pathname,
        url: url,
        title: document.title,
      })
    }
  }, [pathname, searchParams, isE2E])

  return null
}

export function AnalyticsNoScript() {
  // Disabled noscript GA4 tracking to prevent preload warnings
  return null
}
