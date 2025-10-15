'use client'

import { ConsentPreferences } from '@/lib/context/ConsentContext'

const CONSENT_KEY = 'anthrasite_cookie_consent'

export function getCookieConsent(): ConsentPreferences {
  if (typeof window === 'undefined') {
    return {
      analytics: false,
      marketing: false,
      performance: false,
      functional: true,
      doNotSell: false,
      timestamp: new Date().toISOString(),
    }
  }

  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Check if it has the version/preferences structure
      if (parsed.version && parsed.preferences) {
        return {
          analytics: parsed.preferences.analytics ?? false,
          marketing: parsed.preferences.marketing ?? false,
          performance: parsed.preferences.performance ?? false,
          functional: parsed.preferences.functional ?? true,
          doNotSell: parsed.preferences.doNotSell ?? false,
          timestamp: parsed.preferences.timestamp ?? new Date().toISOString(),
        }
      }
      // Fall back to direct structure for backward compatibility
      return {
        analytics: parsed.analytics ?? false,
        marketing: parsed.marketing ?? false,
        performance: parsed.performance ?? false,
        functional: parsed.functional ?? true,
        doNotSell: parsed.doNotSell ?? false,
        timestamp: parsed.timestamp ?? new Date().toISOString(),
      }
    }
  } catch (error) {
    console.error('Error reading consent preferences:', error)
  }

  return {
    analytics: false,
    marketing: false,
    performance: false,
    functional: true,
    doNotSell: false,
    timestamp: new Date().toISOString(),
  }
}

export function onConsentChange(
  callback: (consent: ConsentPreferences) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ConsentPreferences>
    callback(customEvent.detail)
  }

  window.addEventListener('consentUpdated', handler)

  // Return cleanup function
  return () => {
    window.removeEventListener('consentUpdated', handler)
  }
}
