'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { setReferralCode } from '@/lib/referral/storage'

interface ReferralToastProps {
  promoCode: string | null
}

/**
 * ReferralToast - Shows toast notification when user arrives with referral code
 *
 * Validates the code server-side, shows success/error toast, and stores valid codes.
 */
export function ReferralToast({ promoCode }: ReferralToastProps) {
  // Ref to prevent double execution in React Strict Mode
  const hasValidated = useRef(false)

  useEffect(() => {
    if (!promoCode) {
      return
    }

    // Prevent double execution in React Strict Mode
    if (hasValidated.current) {
      return
    }

    // Mark as validated immediately to prevent race conditions
    hasValidated.current = true

    // Validate the code
    async function validateAndShowToast() {
      try {
        const response = await fetch(
          `/api/referral/validate?code=${encodeURIComponent(promoCode!)}`
        )
        const data = await response.json()

        // Delay to ensure Toaster is fully hydrated before showing toast
        await new Promise((resolve) => setTimeout(resolve, 500))

        if (data.valid) {
          // Store the code
          setReferralCode(promoCode!, data.discountDisplay)

          // Build toast message with optional referrer name
          const title = data.referrerName
            ? `Referred by ${data.referrerName}`
            : 'Referral discount activated!'

          // Show success toast with unique ID to prevent duplicates
          toast.success(title, {
            id: 'referral-toast',
            description: `${data.discountDisplay} will be applied at checkout.`,
            duration: 6000,
          })
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
            id: 'referral-toast',
            description:
              messages[data.reason] || 'Please check the code and try again.',
            duration: 6000,
          })
        }
      } catch {
        // Don't show error toast for network issues - user might be offline
      }
    }

    validateAndShowToast()
  }, [promoCode])

  // Component renders nothing - toast is shown via sonner
  return null
}
