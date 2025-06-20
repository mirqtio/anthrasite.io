'use client'

import { useEffect, useState } from 'react'
import { useSiteMode } from '@/lib/context/SiteModeContext'
import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { PurchaseHomepage } from '@/components/homepage/PurchaseHomepage'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { mode, isLoading } = useSiteMode()
  const [isClient, setIsClient] = useState(false)

  // Ensure we only render the actual content on the client to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading state while mode is being detected or during SSR
  if (isLoading || !isClient) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-fade-in">
          <div className="w-8 h-8 bg-anthracite-black animate-pulse" />
        </div>
      </main>
    )
  }

  // Render appropriate homepage based on site mode (client-only)
  return (
    <div suppressHydrationWarning>
      {mode === 'organic' ? <OrganicHomepage /> : <PurchaseHomepage />}
    </div>
  )
}
