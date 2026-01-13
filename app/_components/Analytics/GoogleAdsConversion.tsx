'use client'

import { useEffect, useRef } from 'react'

/**
 * User data for Enhanced Conversions (Google Ads)
 * All fields are optional - provide as much as available for better match rates
 */
export interface EnhancedConversionData {
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  street?: string | null
  city?: string | null
  region?: string | null
  postalCode?: string | null
  country?: string | null
}

interface GoogleAdsConversionProps {
  /** Transaction value in the account currency */
  value: number
  /** Currency code (e.g., 'USD') */
  currency?: string
  /** Unique transaction/order ID for deduplication */
  transactionId: string
  /** User data for Enhanced Conversions */
  userData?: EnhancedConversionData
}

/**
 * Fires a Google Ads conversion event with Enhanced Conversions support.
 * This component should be rendered on the purchase success page.
 *
 * Enhanced Conversions improve match rates by sending hashed first-party
 * customer data (email, phone, address) to Google Ads.
 *
 * @see https://support.google.com/google-ads/answer/9888656
 */
export function GoogleAdsConversion({
  value,
  currency = 'USD',
  transactionId,
  userData,
}: GoogleAdsConversionProps) {
  const hasFired = useRef(false)

  useEffect(() => {
    // Prevent duplicate conversions
    if (hasFired.current) return

    // Check if Google Ads is configured
    const conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL

    if (!conversionId || !conversionLabel) {
      console.log(
        '[GoogleAds] Conversion skipped - missing conversion ID or label'
      )
      return
    }

    // Wait for gtag to be available (loaded by Analytics component)
    const fireConversion = () => {
      if (typeof window === 'undefined' || !window.gtag) {
        console.log('[GoogleAds] Waiting for gtag...')
        return false
      }

      // Build user_data object for Enhanced Conversions
      // Google will hash these values automatically
      const user_data: Record<string, unknown> = {}

      if (userData?.email) {
        user_data.email = userData.email.toLowerCase().trim()
      }
      if (userData?.phone) {
        // Normalize phone number (remove spaces, dashes)
        user_data.phone_number = userData.phone.replace(/[\s\-()]/g, '')
      }

      // Address data
      const address: Record<string, string> = {}
      if (userData?.firstName) {
        address.first_name = userData.firstName.toLowerCase().trim()
      }
      if (userData?.lastName) {
        address.last_name = userData.lastName.toLowerCase().trim()
      }
      if (userData?.street) {
        address.street = userData.street.toLowerCase().trim()
      }
      if (userData?.city) {
        address.city = userData.city.toLowerCase().trim()
      }
      if (userData?.region) {
        address.region = userData.region.toUpperCase().trim()
      }
      if (userData?.postalCode) {
        address.postal_code = userData.postalCode.trim()
      }
      if (userData?.country) {
        address.country = userData.country.toUpperCase().trim()
      }

      if (Object.keys(address).length > 0) {
        user_data.address = address
      }

      // Set user data for Enhanced Conversions (must be set before conversion event)
      if (Object.keys(user_data).length > 0) {
        window.gtag('set', 'user_data', user_data)
        console.log('[GoogleAds] Enhanced Conversions user_data set')
      }

      // Fire the conversion event
      window.gtag('event', 'conversion', {
        send_to: `${conversionId}/${conversionLabel}`,
        value: value,
        currency: currency,
        transaction_id: transactionId,
      })

      console.log('[GoogleAds] Conversion fired:', {
        conversionId,
        value,
        currency,
        transactionId,
        hasUserData: Object.keys(user_data).length > 0,
      })

      hasFired.current = true
      return true
    }

    // Try to fire immediately, otherwise poll for gtag
    if (!fireConversion()) {
      const interval = setInterval(() => {
        if (fireConversion()) {
          clearInterval(interval)
        }
      }, 500)

      // Stop polling after 10 seconds
      setTimeout(() => clearInterval(interval), 10000)
    }
  }, [value, currency, transactionId, userData])

  return null
}
