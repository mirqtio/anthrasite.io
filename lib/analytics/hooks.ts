import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import {
  trackEvent,
  trackPageView,
  identifyUser,
  resetUser,
} from './analytics-client'
import { useConsent } from '@/lib/context/ConsentContext'

/**
 * Hook to check if analytics consent has been given
 */
export function useAnalyticsConsent() {
  const { preferences } = useConsent()
  return preferences?.analytics ?? false
}

/**
 * Hook to check if functional cookies consent has been given
 */
export function useFunctionalConsent() {
  const { preferences } = useConsent()
  return preferences?.functional ?? false
}

/**
 * Hook to track analytics events only if consent is given
 */
export function useAnalyticsEvent() {
  const hasConsent = useAnalyticsConsent()

  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!hasConsent) return

    // Track with Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties)
    }

    // Track with PostHog
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture(eventName, properties)
    }
  }

  return trackEvent
}

/**
 * Hook to get consent status for all categories
 */
export function useConsentStatus() {
  const { preferences, hasConsented } = useConsent()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  return {
    hasConsented,
    isLoading,
    analytics: preferences?.analytics ?? false,
    functional: preferences?.functional ?? false,
    timestamp: preferences?.timestamp,
  }
}

/**
 * Main analytics hook that provides all tracking functions
 */
export function useAnalytics() {
  const track = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      trackEvent(eventName, properties)
    },
    []
  )

  const page = useCallback((properties?: Record<string, any>) => {
    trackPageView(properties)
  }, [])

  const identify = useCallback(
    (userId: string, traits?: Record<string, any>) => {
      identifyUser(userId, traits)
    },
    []
  )

  const reset = useCallback(() => {
    resetUser()
  }, [])

  return {
    track,
    page,
    identify,
    reset,
  }
}

/**
 * Hook to track page views automatically
 */
export function usePageTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return

    trackPageView({
      path: pathname,
      title: typeof document !== 'undefined' ? document.title : '',
    })
  }, [pathname])
}

/**
 * Hook to get a memoized event tracking function
 */
export function useEventTracking() {
  return useCallback((eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, properties)
  }, [])
}

/**
 * Hook to track web vitals metrics
 */
export function useWebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric) => {
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
      })
    })

    onLCP((metric) => {
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
      })
    })

    // Note: FID is deprecated, using INP (Interaction to Next Paint) instead
    onINP((metric) => {
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
      })
    })

    onFCP((metric) => {
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
      })
    })

    onTTFB((metric) => {
      trackEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
      })
    })
  }, [])
}
