'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

/**
 * Hook to track Web Vitals metrics
 * This is a minimal stub implementation
 */
export function useWebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    const handleMetric = (metric: Metric) => {
      // In a real implementation, this would send the metric to analytics
      console.debug('Web Vital:', metric.name, metric.value)
    }

    // Register handlers for each metric
    onCLS(handleMetric)
    onFCP(handleMetric)
    onINP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
  }, [])
}