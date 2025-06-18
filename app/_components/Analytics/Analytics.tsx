'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initializeAnalytics } from '@/lib/analytics/analytics-manager'
import { trackPageView } from '@/lib/analytics/analytics-client'
import { getCookieConsent } from '@/lib/cookies/consent'
import { useWebVitals } from '@/lib/analytics/hooks/useWebVitals'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Track Web Vitals
  useWebVitals()

  // Initialize analytics on mount
  useEffect(() => {
    const consent = getCookieConsent()

    if (consent.analytics) {
      initializeAnalytics({
        ga4: {
          measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!,
          apiSecret: process.env.GA4_API_SECRET,
        },
        posthog: {
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        },
      })
    }
  }, [])

  // Track page views on route change
  useEffect(() => {
    const consent = getCookieConsent()

    if (consent.analytics) {
      const url =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '')

      trackPageView({
        path: pathname,
        url: url,
        title: document.title,
      })
    }
  }, [pathname, searchParams])

  // GA4 Script - lazy loaded after page is interactive
  useEffect(() => {
    const consent = getCookieConsent()
    if (!consent.analytics) return

    // Delay loading GA4 until after page is interactive
    const loadGA4 = () => {
      // Create script element
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`
      script.async = true
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer!.push(args)
      }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        send_page_view: false,
      })
    }

    // Load after a short delay to prioritize critical resources
    if (document.readyState === 'complete') {
      setTimeout(loadGA4, 1000)
    } else {
      window.addEventListener('load', () => setTimeout(loadGA4, 1000))
    }
  }, [])

  return null
}

export function AnalyticsNoScript() {
  // Fallback for users with JavaScript disabled
  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: 'none' }}
        alt=""
        src={`https://www.google-analytics.com/collect?v=1&t=pageview&tid=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}&cid=no-js&dp=${encodeURIComponent('/')}`}
      />
    </noscript>
  )
}
