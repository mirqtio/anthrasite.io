'use client'

/**
 * Referral Code - Client Storage
 *
 * localStorage helpers for persisting referral codes on the client.
 * 30-day expiration, with toast shown flag to prevent repeat toasts.
 */

const STORAGE_KEY = 'referral_code'
const TOAST_SHOWN_KEY = 'referral_toast_shown'
const EXPIRY_DAYS = 30

interface StoredReferral {
  code: string
  discountDisplay: string
  storedAt: number // timestamp
}

/**
 * Store a referral code in localStorage
 */
export function setReferralCode(code: string, discountDisplay: string): void {
  if (typeof window === 'undefined') return

  const data: StoredReferral = {
    code: code.toUpperCase(),
    discountDisplay,
    storedAt: Date.now(),
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.warn('[referral] Failed to store referral code:', e)
  }
}

/**
 * Get the stored referral code if still valid (not expired)
 */
export function getReferralCode(): StoredReferral | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const data: StoredReferral = JSON.parse(stored)

    // Check expiration
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000
    if (Date.now() - data.storedAt > expiryMs) {
      // Expired, remove it
      clearReferralCode()
      return null
    }

    return data
  } catch (e) {
    console.warn('[referral] Failed to read referral code:', e)
    return null
  }
}

/**
 * Clear the stored referral code
 */
export function clearReferralCode(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.warn('[referral] Failed to clear referral code:', e)
  }
}

/**
 * Check if the toast has already been shown for this code
 */
export function hasToastBeenShown(code: string): boolean {
  if (typeof window === 'undefined') return true // SSR safe

  try {
    const shown = localStorage.getItem(TOAST_SHOWN_KEY)
    return shown === code.toUpperCase()
  } catch (e) {
    return true // Assume shown if we can't check
  }
}

/**
 * Mark the toast as shown for a code
 */
export function markToastShown(code: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(TOAST_SHOWN_KEY, code.toUpperCase())
  } catch (e) {
    console.warn('[referral] Failed to mark toast shown:', e)
  }
}

/**
 * Clear the toast shown flag (for testing)
 */
export function clearToastShown(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(TOAST_SHOWN_KEY)
  } catch (e) {
    console.warn('[referral] Failed to clear toast shown:', e)
  }
}
