'use client'

/**
 * A/B Testing React Hooks
 * Convenient hooks for accessing experiment variants
 */

import { useEffect, useRef, useCallback } from 'react'
import { useABTest } from '../context/ABTestingContext'
import { ExperimentVariant } from './types'

/**
 * Get variant for an experiment and track exposure
 * @param experimentId - The experiment ID
 * @param trackOnMount - Whether to track exposure on mount (default: true)
 * @returns The variant ID or null if not assigned
 */
export function useExperiment(
  experimentId: string,
  trackOnMount: boolean = true
): string | null {
  const { getVariant, trackExposure } = useABTest()
  const hasTracked = useRef(false)
  const variantId = getVariant(experimentId)

  useEffect(() => {
    if (trackOnMount && variantId && !hasTracked.current) {
      trackExposure(experimentId)
      hasTracked.current = true
    }
  }, [experimentId, variantId, trackOnMount, trackExposure])

  // Reset tracking flag when experiment or variant changes
  useEffect(() => {
    hasTracked.current = false
  }, [experimentId, variantId])

  return variantId
}

/**
 * Check if user is in a specific variant
 * @param experimentId - The experiment ID
 * @param variantId - The variant ID to check
 * @param trackOnMount - Whether to track exposure if in variant (default: true)
 * @returns True if user is in the specified variant
 */
export function useVariant(
  experimentId: string,
  variantId: string,
  trackOnMount: boolean = true
): boolean {
  const { isInVariant, trackExposure } = useABTest()
  const hasTracked = useRef(false)
  const isInTargetVariant = isInVariant(experimentId, variantId)

  useEffect(() => {
    if (trackOnMount && isInTargetVariant && !hasTracked.current) {
      trackExposure(experimentId)
      hasTracked.current = true
    }
  }, [experimentId, isInTargetVariant, trackOnMount, trackExposure])

  // Reset tracking flag when experiment changes
  useEffect(() => {
    hasTracked.current = false
  }, [experimentId])

  return isInTargetVariant
}

/**
 * Get full experiment details including all variants
 * @param experimentId - The experiment ID
 * @returns The experiment object or null if not found
 */
export function useExperimentDetails(experimentId: string) {
  const { experiments } = useABTest()
  return experiments.get(experimentId) || null
}

/**
 * Get variant configuration for the assigned variant
 * @param experimentId - The experiment ID
 * @returns The variant configuration or null
 */
export function useVariantConfig<T = Record<string, any>>(
  experimentId: string
): T | null {
  const { getVariant, experiments } = useABTest()
  const variantId = getVariant(experimentId)
  const experiment = experiments.get(experimentId)

  if (!variantId || !experiment) {
    return null
  }

  const variant = experiment.variants.find((v) => v.id === variantId)
  return (variant?.config as T) || null
}

/**
 * Track a custom event for an experiment
 * @param experimentId - The experiment ID
 * @returns Function to track custom events
 */
export function useExperimentTracking(experimentId: string) {
  const { getVariant, trackExposure } = useABTest()
  const variantId = getVariant(experimentId)

  const trackEvent = useCallback(
    (eventName: string, metadata?: Record<string, any>) => {
      if (!variantId) {
        return
      }

      // Track the event with experiment context
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track(eventName, {
          experiment_id: experimentId,
          variant_id: variantId,
          ...metadata,
        })
      }
    },
    [experimentId, variantId]
  )

  const trackConversion = useCallback(
    (value?: number, metadata?: Record<string, any>) => {
      trackEvent('experiment_conversion', {
        conversion_value: value,
        ...metadata,
      })
    },
    [trackEvent]
  )

  return {
    variantId,
    trackEvent,
    trackConversion,
    trackExposure: () => trackExposure(experimentId),
  }
}

/**
 * Multi-variant hook for complex experiments
 * @param experimentId - The experiment ID
 * @param variants - Object mapping variant IDs to render functions
 * @param defaultContent - Default content if no variant assigned
 * @returns The content for the assigned variant
 */
export function useMultiVariant<T>(
  experimentId: string,
  variants: Record<string, () => T>,
  defaultContent: () => T
): T {
  const variantId = useExperiment(experimentId)

  if (!variantId || !variants[variantId]) {
    return defaultContent()
  }

  return variants[variantId]()
}

/**
 * Get all active experiments for the current user
 * @returns Array of experiment IDs the user is enrolled in
 */
export function useActiveExperiments(): string[] {
  const { assignments } = useABTest()
  return Array.from(assignments.keys())
}

/**
 * Force refresh experiments from Edge Config
 * @returns Function to trigger refresh
 */
export function useRefreshExperiments() {
  const { refreshExperiments } = useABTest()
  return refreshExperiments
}
