'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SiteModeContext } from './SiteModeContext'
import type { SiteMode } from './SiteModeContext'

interface SiteModeProviderClientProps {
  children: React.ReactNode
  initialMode?: SiteMode
  initialBusinessId?: string | null
}

export function SiteModeProviderClient({
  children,
  initialMode = 'organic',
  initialBusinessId = null,
}: SiteModeProviderClientProps) {
  const [mode, setMode] = useState<SiteMode>(initialMode)
  const [businessId, setBusinessId] = useState<string | null>(initialBusinessId)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for UTM parameter on client side
    const utm = searchParams.get('utm')

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
  }, [searchParams])

  return (
    <SiteModeContext.Provider value={{ mode, businessId, isLoading }}>
      {children}
    </SiteModeContext.Provider>
  )
}
