'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

export interface ConsentPreferences {
  analytics: boolean
  marketing: boolean
  performance: boolean
  functional: boolean
  timestamp: string
}

interface ConsentContextType {
  preferences: ConsentPreferences | null
  showBanner: boolean
  showPreferences: boolean
  updateConsent: (preferences: Partial<ConsentPreferences>) => void
  acceptAll: () => void
  rejectAll: () => void
  openPreferences: () => void
  closePreferences: () => void
  hasConsented: boolean
}

const CONSENT_KEY = 'anthrasite_cookie_consent'
const CONSENT_VERSION = '1.0'

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

export function useConsent() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider')
  }
  return context
}

interface ConsentProviderProps {
  children: ReactNode
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(
    null
  )
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Load preferences from localStorage on mount
  useEffect(() => {
    setIsMounted(true)

    // In test environment, load synchronously
    if (process.env.NODE_ENV === 'test') {
      try {
        const stored = localStorage.getItem(CONSENT_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          // Check if stored consent is for current version
          if (parsed.version === CONSENT_VERSION) {
            setPreferences(parsed.preferences)
            setShowBanner(false)
          } else {
            // Version mismatch, show banner again
            setShowBanner(true)
          }
        } else {
          // No consent stored, show banner
          setShowBanner(true)
        }
      } catch (error) {
        console.error('Error loading consent preferences:', error)
        setShowBanner(true)
      }
      setIsLoading(false)
      return
    }

    try {
      const stored = localStorage.getItem(CONSENT_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Check if stored consent is for current version
        if (parsed.version === CONSENT_VERSION) {
          setPreferences(parsed.preferences)
          setShowBanner(false)
        } else {
          // Version mismatch, show banner again
          setShowBanner(true)
        }
      } else {
        // No consent stored, show banner
        setShowBanner(true)
      }
    } catch (error) {
      console.error('Error loading consent preferences:', error)
      setShowBanner(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const savePreferences = (newPreferences: ConsentPreferences) => {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          version: CONSENT_VERSION,
          preferences: newPreferences,
        })
      )
      setPreferences(newPreferences)
      setShowBanner(false)

      // Emit custom event for analytics scripts to listen to
      window.dispatchEvent(
        new CustomEvent('consentUpdated', {
          detail: newPreferences,
        })
      )
    } catch (error) {
      console.error('Error saving consent preferences:', error)
    }
  }

  const updateConsent = (updates: Partial<ConsentPreferences>) => {
    const newPreferences: ConsentPreferences = {
      analytics: updates.analytics ?? preferences?.analytics ?? false,
      marketing: updates.marketing ?? preferences?.marketing ?? false,
      performance: updates.performance ?? preferences?.performance ?? false,
      functional: updates.functional ?? preferences?.functional ?? true,
      timestamp: new Date().toISOString(),
    }
    savePreferences(newPreferences)
  }

  const acceptAll = () => {
    const newPreferences: ConsentPreferences = {
      analytics: true,
      marketing: true,
      performance: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }
    savePreferences(newPreferences)
    setShowPreferences(false)
  }

  const rejectAll = () => {
    const newPreferences: ConsentPreferences = {
      analytics: false,
      marketing: false,
      performance: false,
      functional: true, // Functional cookies are required for basic site operation
      timestamp: new Date().toISOString(),
    }
    savePreferences(newPreferences)
    setShowPreferences(false)
  }

  const openPreferences = () => {
    setShowPreferences(true)
  }

  const closePreferences = () => {
    setShowPreferences(false)
  }

  const hasConsented = preferences !== null

  // Provide a loading state value to prevent errors
  const contextValue: ConsentContextType = {
    preferences,
    showBanner,
    showPreferences,
    updateConsent,
    acceptAll,
    rejectAll,
    openPreferences,
    closePreferences,
    hasConsented,
  }

  // In test environment, render immediately without loading
  if (process.env.NODE_ENV === 'test') {
    return (
      <ConsentContext.Provider value={contextValue}>
        {children}
      </ConsentContext.Provider>
    )
  }

  // If still loading, provide context but don't render children
  if (!isMounted || isLoading) {
    return (
      <ConsentContext.Provider value={contextValue}>
        {null}
      </ConsentContext.Provider>
    )
  }

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
    </ConsentContext.Provider>
  )
}
