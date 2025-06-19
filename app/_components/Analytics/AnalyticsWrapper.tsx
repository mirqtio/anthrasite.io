'use client'

import { Suspense } from 'react'
import { Analytics, AnalyticsNoScript } from './Analytics'

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
