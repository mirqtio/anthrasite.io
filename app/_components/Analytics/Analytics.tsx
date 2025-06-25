'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initializeAnalytics } from '@/lib/analytics/analytics-manager'
import { trackPageView } from '@/lib/analytics/analytics-client'
import { getCookieConsent, onConsentChange } from '@/lib/cookies/consent'
import { useWebVitals } from '@/lib/analytics/hooks/useWebVitals'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState<boolean>(false)

  // Track Web Vitals
  useWebVitals()

  // Track consent changes and initialize analytics
  useEffect(() => {
    // Check initial consent
    const initialConsent = getCookieConsent()
    setHasAnalyticsConsent(initialConsent.analytics)

    if (initialConsent.analytics) {
      const manager = initializeAnalytics({
        ga4: {
          measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!,
          apiSecret: process.env.GA4_API_SECRET,
        },
        posthog: {
          apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        },
        hotjar: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID
          ? {
              siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
            }
          : undefined,
      })
      
      // Force initialization to complete
      manager.initialize().then(() => {
        console.log('[Analytics] Manager initialized successfully')
      })
    }

    // Listen for consent changes
    const unsubscribe = onConsentChange((newConsent) => {
      setHasAnalyticsConsent(newConsent.analytics)

      if (newConsent.analytics) {
        const manager = initializeAnalytics({
          ga4: {
            measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID!,
            apiSecret: process.env.GA4_API_SECRET,
          },
          posthog: {
            apiKey: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
          },
          hotjar: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID
            ? {
                siteId: process.env.NEXT_PUBLIC_HOTJAR_SITE_ID,
              }
            : undefined,
        })
        
        // Force initialization to complete
        manager.initialize().then(() => {
          console.log('[Analytics] Manager initialized on consent change')
        })
      }
    })

    return unsubscribe
  }, [])

  // Track page views on route change
  useEffect(() => {
    if (hasAnalyticsConsent && pathname) {
      // Skip the initial page view since GA4 will track it automatically
      const isInitialLoad = !window.gtag
      
      if (!isInitialLoad) {
        const url =
          pathname +
          (searchParams.toString() ? `?${searchParams.toString()}` : '')

        trackPageView({
          path: pathname,
          url: url,
          title: document.title,
        })
      }
    }
  }, [pathname, searchParams, hasAnalyticsConsent])

  // GA4 Script - lazy loaded after page is interactive and consent is given
  useEffect(() => {
    if (!hasAnalyticsConsent) return

    // Delay loading GA4 until after page is interactive
    const loadGA4 = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="googletagmanager.com"]')) {
        return
      }

      // Create script element
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
      }
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer!.push(args)
      }
      window.gtag = gtag
      gtag('js', new Date())
      gtag('config', measurementId, {
        page_path: window.location.pathname,
        send_page_view: true, // Enable automatic page view tracking
      })
      console.log('[GA4] Initialized with measurement ID:', measurementId)
    }

    // Load GA4 immediately after consent is given
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadGA4)
    } else {
      // DOM is already loaded, load GA4 immediately
      loadGA4()
    }
  }, [hasAnalyticsConsent])

  return null
}

export function AnalyticsNoScript() {
  // Disabled noscript GA4 tracking to prevent preload warnings
  return null
}
