'use client'

import { Suspense, lazy } from 'react'

// Lazy load analytics to reduce initial bundle size
const Analytics = lazy(() => 
  import('./Analytics').then(mod => ({ default: mod.Analytics }))
)

const AnalyticsNoScript = lazy(() => 
  import('./Analytics').then(mod => ({ default: mod.AnalyticsNoScript }))
)

function AnalyticsFallback() {
  return null // No fallback needed for analytics
}

export function AnalyticsWrapper() {
  return (
    <Suspense fallback={<AnalyticsFallback />}>
      <Analytics />
    </Suspense>
  )
}

export function AnalyticsNoScriptWrapper() {
  return (
    <Suspense fallback={<AnalyticsFallback />}>
      <AnalyticsNoScript />
    </Suspense>
  )
}
