'use client'

import { useSiteMode } from '@/lib/context/SiteModeContext'
import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { PurchaseHomepage } from '@/components/homepage/PurchaseHomepage'

// export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { mode, isLoading } = useSiteMode()

  // Show loading state while mode is being detected
  if (isLoading) {
    return (
      <main className="min-h-screen bg-carbon flex items-center justify-center">
        <div className="animate-fade-in">
          <div className="w-8 h-8 bg-white animate-pulse" />
        </div>
      </main>
    )
  }

  // Render appropriate homepage based on site mode
  if (mode === 'organic') {
    return <OrganicHomepage />
  } else {
    return <PurchaseHomepage />
  }
}
