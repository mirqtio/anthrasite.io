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

interface CookieCategory {
  id: 'analytics' | 'functional'
  name: string
  description: string
  required?: boolean
}

const categories: CookieCategory[] = [
  {
    id: 'functional',
    name: 'Functional Cookies',
    description:
      'These cookies enable core functionality such as security, network management, and accessibility. They help us remember your preferences and settings to improve your experience.',
    required: false,
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description:
      'We use Google Analytics 4 and PostHog to understand how visitors interact with our website. These tools help us improve our services by collecting anonymized data about page views, session duration, and user behavior.',
    required: false,
  },
]

export function ConsentPreferences() {
  const {
    showPreferences,
    preferences,
    updateConsent,
    closePreferences,
    acceptAll,
    rejectAll,
  } = useConsent()
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [localPreferences, setLocalPreferences] = useState({
    analytics: preferences?.analytics ?? false,
    functional: preferences?.functional ?? true,
  })

  useEffect(() => {
    if (showPreferences) {
      // Reset local preferences when modal opens
      setLocalPreferences({
        analytics: preferences?.analytics ?? false,
        functional: preferences?.functional ?? true,
      })
      // Immediate visibility for test reliability - no delays
      setIsVisible(true)
      setIsExiting(false)
    } else {
      setIsExiting(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setIsExiting(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [showPreferences, preferences])

  // Handle Escape key to close modal
  useEffect(() => {
    if (!showPreferences) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreferences()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showPreferences, closePreferences])

  const handleSave = () => {
    updateConsent(localPreferences)
    closePreferences()
  }

  const handleToggle = (categoryId: 'analytics' | 'functional') => {
    setLocalPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  if (!showPreferences && !isExiting) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{
          zIndex: 10000,
          opacity: isVisible && !isExiting ? 1 : 0,
          transition:
            process.env.NODE_ENV === 'test'
              ? 'none'
              : `opacity ${animation.duration.normal} ${animation.easing.easeOut}`,
          transitionTimingFunction: animation.easing.easeOut,
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
        onClick={closePreferences}
        aria-hidden="true"
        data-testid="consent-modal-backdrop"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{
          zIndex: 10000,
          pointerEvents: 'none', // Allow clicks to pass through to backdrop
        }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{
            width: '100%',
            maxWidth: '42rem', // 672px (2xl)
            backgroundColor: colors.anthracite.white,
            borderRadius: radii.xl,
            opacity: isVisible && !isExiting ? 1 : 0,
            transition:
              process.env.NODE_ENV === 'test'
                ? 'none'
                : `opacity ${animation.duration.normal} ${animation.easing.easeOut}`,
            visibility: isVisible ? 'visible' : 'hidden',
            pointerEvents: isVisible ? 'auto' : 'none', // Content div handles clicks
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preferences-title"
          data-testid="consent-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: colors.anthracite.gray[100] }}
          >
            <h2
              id="preferences-title"
              className="text-xl font-semibold"
              style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.anthracite.black,
              }}
              data-testid="cookie-preferences-title"
            >
              Cookie Preferences
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <p
              className="text-sm mb-6"
              style={{
                fontSize: typography.fontSize.sm,
                lineHeight: typography.lineHeight.normal,
                color: colors.anthracite.black,
                opacity: 0.7,
              }}
            >
              We use cookies and similar technologies to help personalize
              content, tailor and measure ads, and provide a better experience.
              You can customize your choices below.
            </p>

            {/* Essential Cookies (Always On) */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3
                    className="font-medium mb-1"
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.anthracite.black,
                    }}
                  >
                    Essential Cookies
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.anthracite.black,
                      opacity: 0.7,
                    }}
                  >
                    Required for the website to function properly. These cookies
                    ensure basic functionalities and security features of the
                    website.
                  </p>
                </div>
                <div className="ml-4 mt-1">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{
                      fontSize: typography.fontSize.xs,
                      backgroundColor: colors.anthracite.gray[100],
                      color: colors.anthracite.black,
                      opacity: 0.5,
                    }}
                  >
                    Always on
                  </span>
                </div>
              </div>
            </div>

            {/* Optional Categories */}
            {categories.map((category) => (
              <div key={category.id} className="mb-6 last:mb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3
                      className="font-medium mb-1"
                      style={{
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium,
                        color: colors.anthracite.black,
                      }}
                    >
                      {category.name}
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        fontSize: typography.fontSize.sm,
                        color: colors.anthracite.black,
                        opacity: 0.7,
                      }}
                    >
                      {category.description}
                    </p>
                  </div>
                  <div className="ml-4 mt-1">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={localPreferences[category.id]}
                      aria-label={`${category.name} - ${localPreferences[category.id] ? 'Enabled' : 'Disabled'}`}
                      onClick={() => handleToggle(category.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${animation.duration.fast}`}
                      style={{
                        backgroundColor: localPreferences[category.id]
                          ? colors.anthracite.blue
                          : colors.anthracite.gray[100],
                      }}
                    >
                      <span className="sr-only">
                        {localPreferences[category.id] ? 'Disable' : 'Enable'}{' '}
                        {category.name}
                      </span>
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${animation.duration.fast}`}
                        style={{
                          transform: localPreferences[category.id]
                            ? 'translateX(24px)'
                            : 'translateX(4px)',
                          transitionTimingFunction: animation.easing.easeOut,
                        }}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex flex-col sm:flex-row gap-3 sm:justify-end"
            style={{ borderColor: colors.anthracite.gray[100] }}
          >
            <Button
              variant="ghost"
              size="md"
              onClick={rejectAll}
              data-testid="preferences-reject-all-button"
            >
              Reject all
            </Button>
            <Button variant="secondary" size="md" onClick={acceptAll}>
              Accept all
            </Button>
            <Button variant="primary" size="md" onClick={handleSave}>
              Save preferences
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
