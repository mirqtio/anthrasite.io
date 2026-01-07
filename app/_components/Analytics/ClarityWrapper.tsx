'use client'

import { Suspense, lazy } from 'react'

// Lazy load Clarity to reduce initial bundle size
const Clarity = lazy(() =>
  import('./Clarity').then((mod) => ({ default: mod.Clarity }))
)

export function ClarityWrapper() {
  return (
    <Suspense fallback={null}>
      <Clarity />
    </Suspense>
  )
}
