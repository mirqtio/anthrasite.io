'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type SiteMode = 'organic' | 'purchase'

interface SiteModeContextValue {
  mode: SiteMode
  businessId: string | null
  isLoading: boolean
}

export const SiteModeContext = createContext<SiteModeContextValue | null>(null)

export function useSiteMode() {
  const context = useContext(SiteModeContext)
  if (!context) {
    throw new Error('useSiteMode must be used within SiteModeProvider')
  }
  return context
}

interface SiteModeProviderProps {
  children: React.ReactNode
  initialMode?: SiteMode
  initialBusinessId?: string | null
}

export function SiteModeProvider({
  children,
  initialMode,
  initialBusinessId,
}: SiteModeProviderProps) {
  // If initial props are provided, use them and don't start in loading state
  const hasInitialProps = initialMode !== undefined
  const [mode, setMode] = useState<SiteMode>(initialMode || 'organic')
  const [businessId, setBusinessId] = useState<string | null>(
    initialBusinessId || null
  )
  // Start with loading false unless we need to detect mode
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // If we have initial props, don't do any client-side detection
    if (hasInitialProps) {
      setIsLoading(false)
      return
    }

    // Check URL parameters on client side
    const urlParams = new URLSearchParams(window.location.search)
    const utm = urlParams.get('utm')

    if (utm) {
      // UTM present - we're in purchase mode
      setMode('purchase')
      setBusinessId(null) // UTM doesn't provide business ID directly
      setIsLoading(false)
      return
    }

    // Check cookies on client side
    const cookies = document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      },
      {} as Record<string, string>
    )

    if (cookies.site_mode === 'purchase' && cookies.business_id) {
      setMode('purchase')
      setBusinessId(cookies.business_id)
    } else {
      setMode('organic')
      setBusinessId(null)
    }

    setIsLoading(false)
  }, [hasInitialProps])

  return (
    <SiteModeContext.Provider value={{ mode, businessId, isLoading }}>
      {children}
    </SiteModeContext.Provider>
  )
}
