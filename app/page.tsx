'use client'

import dynamicImport from 'next/dynamic'
import { useSiteMode } from '@/lib/context/SiteModeContext'

// Lazy load homepages with code splitting
// This prevents loading PurchaseHomepage bundle for organic traffic
const OrganicHomepage = dynamicImport(
  () =>
    import('@/components/homepage/OrganicHomepage').then(
      (mod) => mod.OrganicHomepage
    ),
  {
    loading: () => (
      <main className="min-h-screen bg-carbon flex items-center justify-center">
        <div className="animate-fade-in">
          <div className="w-8 h-8 bg-white animate-pulse" />
        </div>
      </main>
    ),
  }
)

const PurchaseHomepage = dynamicImport(
  () =>
    import('@/components/homepage/PurchaseHomepage').then(
      (mod) => mod.PurchaseHomepage
    ),
  {
    loading: () => (
      <main className="min-h-screen bg-carbon flex items-center justify-center">
        <div className="animate-fade-in">
          <div className="w-8 h-8 bg-white animate-pulse" />
        </div>
      </main>
    ),
    ssr: false, // Client-only rendering (was causing build hang with ssr:true)
  }
)

// Force dynamic rendering - prevents build-time static generation hang
export const dynamic = 'force-dynamic'

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
