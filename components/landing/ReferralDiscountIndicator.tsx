'use client'

import { useState, useEffect } from 'react'

interface ReferralDiscountIndicatorProps {
  discountDisplay: string
  onDismiss: () => void
}

/**
 * ReferralDiscountIndicator - Animated toast showing active discount
 *
 * Slides in from bottom, stays for 6 seconds, then slides out.
 * Positioned just above the CTA on both mobile and desktop.
 */
export function ReferralDiscountIndicator({
  discountDisplay,
}: ReferralDiscountIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  // Format: "$100 off" -> "$100 discount applied"
  const formattedDiscount = discountDisplay.replace(/\s*off\s*/i, '')

  useEffect(() => {
    // Slide in after a brief delay
    const showTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Auto-dismiss after 6 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 6100)

    // Remove from DOM after slide-out animation completes
    const removeTimer = setTimeout(() => {
      setShouldRender(false)
    }, 6500)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-[1050] transition-all duration-300 ease-out
        bottom-[72px] min-[800px]:bottom-[200px]
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          borderLeft: '4px solid #22C55E',
        }}
      >
        <span className="text-white text-[16px] min-[800px]:text-[18px] font-medium">
          {formattedDiscount} discount applied
        </span>
      </div>
    </div>
  )
}
