'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals'
import { trackWebVitals } from '../analytics-client'

export function useWebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    onCLS((metric) => {
      trackWebVitals({ CLS: metric.value })
    })

    onFCP((metric) => {
      trackWebVitals({ FCP: metric.value })
    })

    onLCP((metric) => {
      trackWebVitals({ LCP: metric.value })
    })

    onTTFB((metric) => {
      trackWebVitals({ TTFB: metric.value })
    })

    onINP((metric) => {
      trackWebVitals({ INP: metric.value })
    })
  }, [])
}
