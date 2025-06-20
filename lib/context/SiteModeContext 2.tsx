'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type SiteMode = 'organic' | 'purchase'

interface SiteModeContextValue {
  mode: SiteMode
  businessId: string | null
  isLoading: boolean
}

export const SiteModeContext = createContext<SiteModeContextValue>({
  mode: 'organic',
  businessId: null,
  isLoading: true,
})

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
  initialMode = 'organic',
  initialBusinessId = null,
}: SiteModeProviderProps) {
  const [mode, setMode] = useState<SiteMode>(initialMode)
  const [businessId, setBusinessId] = useState<string | null>(initialBusinessId)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check URL parameters on client side
    const urlParams = new URLSearchParams(window.location.search)
    const utm = urlParams.get('utm')

    if (utm) {
      // UTM present - we're in purchase mode
      setMode('purchase')
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
  }, [])

  return (
    <SiteModeContext.Provider value={{ mode, businessId, isLoading }}>
      {children}
    </SiteModeContext.Provider>
  )
}
