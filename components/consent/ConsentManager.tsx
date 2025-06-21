'use client'

import { ConsentBanner } from './ConsentBanner'
import { ConsentPreferences } from './ConsentPreferences'

export function ConsentManager() {
  // Analytics initialization is handled by the Analytics component
  // This component only manages the consent UI

  return (
    <>
      <ConsentBanner />
      <ConsentPreferences />
    </>
  )
}
