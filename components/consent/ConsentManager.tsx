'use client'

import { useEffect } from 'react'
import { useConsent } from '@/lib/context/ConsentContext'
import { ConsentBanner } from './ConsentBanner'
import { ConsentPreferences } from './ConsentPreferences'
import { initializeAnalytics } from '@/lib/analytics/consent-loader'

export function ConsentManager() {
  const { preferences } = useConsent()

  // Initialize analytics when preferences change
  useEffect(() => {
    initializeAnalytics(preferences)
  }, [preferences])

  return (
    <>
      <ConsentBanner />
      <ConsentPreferences />
    </>
  )
}
