'use client'

import { OrganicHomepage } from '@/components/homepage/OrganicHomepage'
import { useState, lazy, Suspense } from 'react'

// Lazy load PurchaseHomepage to prevent it from being included in the main bundle
const PurchaseHomepage = lazy(() =>
  import('@/components/homepage/PurchaseHomepage').then((mod) => ({
    default: mod.PurchaseHomepage,
  }))
)

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-carbon flex items-center justify-center">
      <div className="animate-fade-in">
        <div className="w-8 h-8 bg-white animate-pulse" />
      </div>
    </main>
  )
}

export default function PreviewPage() {
  const [mode, setMode] = useState<'organic' | 'purchase'>('organic')

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded shadow-lg">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mode === 'purchase'}
            onChange={(e) => setMode(e.target.checked ? 'purchase' : 'organic')}
          />
          Purchase Mode
        </label>
      </div>

      {mode === 'organic' ? (
        <OrganicHomepage />
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <PurchaseHomepage />
        </Suspense>
      )}
    </div>
  )
}
