'use client'

import dynamic from 'next/dynamic'
import { useSiteMode } from '@/lib/context/SiteModeContext'

// Dynamically import homepage components
const OrganicHomepage = dynamic(
  () =>
    import('@/components/homepage/OrganicHomepage').then((mod) => ({
      default: mod.OrganicHomepage,
    })),
  {
    loading: () => <HomepageLoading />,
  }
)

const PurchaseHomepage = dynamic(
  () =>
    import('@/components/homepage/PurchaseHomepage').then((mod) => ({
      default: mod.PurchaseHomepage,
    })),
  {
    loading: () => <HomepageLoading />,
  }
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

// export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { mode } = useSiteMode()

  // Render appropriate homepage based on site mode without blocking
  // The dynamic import will handle its own loading state
  if (mode === 'organic') {
    return <OrganicHomepage />
  } else {
    return <PurchaseHomepage />
  }
}
