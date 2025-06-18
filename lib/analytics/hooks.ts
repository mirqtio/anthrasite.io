import { useEffect, useState } from 'react'
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