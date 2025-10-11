'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initializeAnalytics } from '@/lib/analytics/analytics-manager-optimized'
import { trackPageView } from '@/lib/analytics/analytics-client'
import { getCookieConsent, onConsentChange } from '@/lib/cookies/consent'
import { useWebVitals } from '@/lib/analytics/hooks/useWebVitals'

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState<boolean>(false)

  // Skip analytics in E2E test mode to prevent external script loading failures
  const isE2E =
    process.env.NEXT_PUBLIC_E2E_TESTING === 'true' ||
    process.env.NEXT_PUBLIC_E2E === 'true'

  // Track Web Vitals
  useWebVitals()

  // Track consent changes and initialize analytics
  useEffect(() => {
    // Skip in E2E mode
    if (isE2E) return

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
          host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
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
            host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
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
  }, [isE2E])

  // Track page views on route change
  useEffect(() => {
    // Skip in E2E mode
    if (isE2E) return

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
  }, [pathname, searchParams, hasAnalyticsConsent, isE2E])

  // GA4 Script - lazy loaded after page is interactive and consent is given
  useEffect(() => {
    // Skip in E2E mode
    if (isE2E) return
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

        // Initialize gtag after script loads
        window.dataLayer = window.dataLayer || []
        // Define gtag function - IMPORTANT: must use arguments, not spread operator
        // eslint-disable-next-line prefer-rest-params
        window.gtag = function () {
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer!.push(arguments)
        }
        // Call the global gtag function
        window.gtag('js', new Date())
        window.gtag('config', measurementId, {
          page_path: window.location.pathname,
          send_page_view: true, // Enable automatic page view tracking
          debug_mode: true, // Enable debug mode to see events in real-time
        })
        console.log('[GA4] Initialized with measurement ID:', measurementId)

        // Send a test event to verify GA4 is working
        window.gtag('event', 'analytics_initialized', {
          event_category: 'engagement',
          event_label: 'GA4 Script Loaded',
          value: 1,
        })
        console.log('[GA4] Test event sent')
      }
      script.onerror = () => {
        console.error('[GA4] Failed to load script')
      }
      document.head.appendChild(script)
    }

    // Load GA4 immediately after consent is given
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadGA4)
    } else {
      // DOM is already loaded, load GA4 immediately
      loadGA4()
    }
  }, [hasAnalyticsConsent, isE2E])

  return null
}

export function AnalyticsNoScript() {
  // Disabled noscript GA4 tracking to prevent preload warnings
  return null
}
