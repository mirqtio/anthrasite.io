'use client'

import { useEffect, useState } from 'react'
import { useConsent } from '@/lib/context/ConsentContext'
import { Button } from '@/components/Button'
import {
  animation,
  colors,
  spacing,
  typography,
  radii,
  shadows,
} from '@/lib/design-system/tokens'

export function ConsentBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useConsent()
  const [isVisible, setIsVisible] = useState(false) // Always start with false
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (showBanner) {
      // Show immediately for better user experience
      setIsVisible(true)
    } else {
      setIsExiting(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsExiting(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [showBanner])

  if (!showBanner && !isExiting) return null

  return (
    <div
      data-testid="consent-banner"
      className={`fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 transition-all ${animation.duration.normal}`}
      style={{
        transform:
          isVisible && !isExiting ? 'translateY(0)' : 'translateY(100%)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transitionTimingFunction: animation.easing.easeOut,
      }}
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div
        className="mx-auto max-w-7xl bg-white rounded-2xl p-6 md:p-8 relative"
        style={{
          backgroundColor: colors.anthracite.white,
          boxShadow: shadows.xl,
          borderRadius: radii.xl,
          border: `1px solid ${colors.anthracite.gray[100]}`,
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h2
              className="text-lg font-semibold mb-2"
              style={{
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.anthracite.black,
              }}
            >
              We value your privacy
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.relaxed,
                color: colors.anthracite.black,
                opacity: 0.7,
              }}
            >
              We use cookies to enhance your browsing experience, analyze site
              traffic, and personalize content. By clicking "Accept all", you
              consent to our use of cookies. You can manage your preferences or
              learn more about our cookie policy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="ghost"
              size="md"
              onClick={openPreferences}
              aria-label="Manage cookie preferences"
              data-testid="cookie-preferences-button"
            >
              Manage cookie preferences
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={rejectAll}
              aria-label="Reject all cookies"
              data-testid="banner-reject-all-button"
            >
              Reject all
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={acceptAll}
              aria-label="Accept all cookies"
              data-testid="accept-all-cookies-button"
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
