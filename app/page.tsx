'use client'

import { useSiteMode } from '@/lib/context/SiteModeContext'
import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { Suspense, lazy } from 'react'

// Lazy load PurchaseHomepage only when needed
const PurchaseHomepage = lazy(() =>
  import('@/components/homepage/PurchaseHomepage').then((mod) => ({
    default: mod.PurchaseHomepage,
  }))
)

function HomepageLoading() {
  return (
    <main className="min-h-screen bg-carbon flex items-center justify-center">
      <div className="animate-fade-in">
        <div className="w-8 h-8 bg-white animate-pulse" />
      </div>
    </main>
  )
}

export default function HomePage() {
  const { mode, isLoading } = useSiteMode()

  // Show loading while determining mode
  if (isLoading) {
    return <HomepageLoading />
  }

  // For organic traffic (the common case), render directly without lazy loading
  if (mode === 'organic') {
    return <OrganicHomepage />
  }

  // For purchase traffic (rare case), use lazy loading
  return (
    <Suspense fallback={<HomepageLoading />}>
      <PurchaseHomepage />
    </Suspense>
  )
}
