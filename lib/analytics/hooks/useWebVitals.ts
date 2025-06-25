'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals'
import * as Sentry from '@sentry/nextjs'

/**
 * Hook to track Web Vitals metrics and send them to Sentry
 */
export function useWebVitals() {
  useEffect(() => {
    // Track Core Web Vitals
    const handleMetric = (metric: Metric) => {
      // Log the metric
      console.debug('Web Vital:', metric.name, metric.value)

      // Send to Sentry
      if (typeof window !== 'undefined' && window.Sentry) {
        // Send web vital as a custom measurement
        Sentry.getCurrentScope().setContext('web-vitals', {
          [metric.name]: {
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            rating: metric.rating || 'none',
            navigationType: metric.navigationType,
          },
        })

        // Also capture as a breadcrumb
        Sentry.addBreadcrumb({
          category: 'web-vitals',
          message: `${metric.name}: ${metric.value}`,
          level: 'info',
          data: {
            value: metric.value,
            delta: metric.delta,
            id: metric.id,
            rating: metric.rating || 'none',
          },
        })
      }

      // Also send as a custom event to Google Analytics if available
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          value: Math.round(
            metric.name === 'CLS' ? metric.value * 1000 : metric.value
          ),
          metric_id: metric.id,
          metric_value: metric.value,
          metric_delta: metric.delta,
          metric_rating: metric.rating || 'none',
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
        })
      }
    }

    // Register handlers for each metric
    onCLS(handleMetric)
    onFCP(handleMetric)
    onINP(handleMetric)
    onLCP(handleMetric)
    onTTFB(handleMetric)
  }, [])
}
