'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import {
  setReferralCode,
  hasToastBeenShown,
  markToastShown,
} from '@/lib/referral/storage'

interface ReferralToastProps {
  promoCode: string | null
}

/**
 * ReferralToast - Shows toast notification when user arrives with referral code
 *
 * Validates the code server-side, shows success/error toast, and stores valid codes.
 * Only shows toast once per code (tracks via localStorage).
 */
export function ReferralToast({ promoCode }: ReferralToastProps) {
  useEffect(() => {
    if (!promoCode) return

    // Check if toast already shown for this code
    if (hasToastBeenShown(promoCode)) {
      return
    }

    // Validate the code
    async function validateAndShowToast() {
      try {
        const response = await fetch(
          `/api/referral/validate?code=${encodeURIComponent(promoCode!)}`
        )
        const data = await response.json()

        if (data.valid) {
          // Store the code
          setReferralCode(promoCode!, data.discountDisplay)

          // Show success toast
          toast.success('Referral discount activated!', {
            description: `${data.discountDisplay} will be applied at checkout.`,
            duration: 4000,
          })

          // Mark toast as shown
          markToastShown(promoCode!)
        } else {
          // Show error toast based on reason
          const messages: Record<string, string> = {
            not_found: "This referral code doesn't exist.",
            disabled: 'This referral code is no longer active.',
            expired: 'This referral code has expired.',
            max_redemptions: 'This referral code has reached its usage limit.',
            ff_disabled: 'Friends & Family codes are currently disabled.',
          }

          toast.error('Invalid referral code', {
            description:
              messages[data.reason] || 'Please check the code and try again.',
            duration: 5000,
          })

          // Still mark as shown to avoid repeated errors
          markToastShown(promoCode!)
        }
      } catch (error) {
        console.error('[ReferralToast] Validation error:', error)
        // Don't show error toast for network issues - user might be offline
      }
    }

    validateAndShowToast()
  }, [promoCode])

  // This component doesn't render anything - it just handles the toast
  return null
}
