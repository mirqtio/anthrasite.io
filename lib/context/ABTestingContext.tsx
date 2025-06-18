'use client'

/**
 * A/B Testing Context Provider
 * Provides experiment variant information to components
 * Tracks exposure events when variants are viewed
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import {
  Experiment,
  VariantAssignment,
  ABTestContextValue,
} from '../ab-testing/types'
import {
  getVariantAssignment,
  batchAssignVariants,
} from '../ab-testing/variant-assignment'
import {
  fetchExperiments,
  subscribeToExperimentChanges,
} from '../ab-testing/edge-config'

// Create context
const ABTestContext = createContext<ABTestContextValue | null>(null)

// Default user ID generation (can be overridden)
function generateUserId(): string {
  // Check for existing ID in localStorage
  if (typeof window !== 'undefined') {
    const existingId = localStorage.getItem('ab_user_id')
    if (existingId) {
      return existingId
    }

    // Generate new ID
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('ab_user_id', newId)
    return newId
  }

  // Server-side fallback
  return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

interface ABTestProviderProps {
  children: ReactNode
  userId?: string
  initialExperiments?: Map<string, Experiment>
  onExposure?: (
    experimentId: string,
    variantId: string,
    metadata?: Record<string, any>
  ) => void
}

export function ABTestProvider({
  children,
  userId: providedUserId,
  initialExperiments,
  onExposure,
}: ABTestProviderProps) {
  const pathname = usePathname()
  const [experiments, setExperiments] = useState<Map<string, Experiment>>(
    initialExperiments || new Map()
  )
  const [assignments, setAssignments] = useState<
    Map<string, VariantAssignment>
  >(new Map())
  const [exposedVariants, setExposedVariants] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(!initialExperiments)

  // Get or generate user ID
  const userId = useMemo(
    () => providedUserId || generateUserId(),
    [providedUserId]
  )

  // Load experiments on mount
  useEffect(() => {
    if (!initialExperiments) {
      fetchExperiments()
        .then((fetchedExperiments) => {
          setExperiments(fetchedExperiments)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Failed to load experiments:', error)
          setIsLoading(false)
        })
    }
  }, [initialExperiments])

  // Subscribe to experiment changes
  useEffect(() => {
    const unsubscribe = subscribeToExperimentChanges((updatedExperiments) => {
      setExperiments(updatedExperiments)
    })

    return unsubscribe
  }, [])

  // Assign variants when experiments or user ID changes
  useEffect(() => {
    async function assignVariants() {
      if (experiments.size > 0 && userId) {
        const newAssignments = await batchAssignVariants(userId, experiments)
        setAssignments(newAssignments)
      }
    }
    assignVariants()
  }, [experiments, userId])

  // Reset exposed variants on navigation
  useEffect(() => {
    setExposedVariants(new Set())
  }, [pathname])

  // Get variant for an experiment
  const getVariant = useCallback(
    (experimentId: string): string | null => {
      const assignment = assignments.get(experimentId)
      return assignment ? assignment.variantId : null
    },
    [assignments]
  )

  // Track exposure event
  const trackExposure = useCallback(
    (experimentId: string, metadata?: Record<string, any>) => {
      const variantId = getVariant(experimentId)

      if (!variantId) {
        return
      }

      const exposureKey = `${experimentId}:${variantId}`

      // Only track once per page view
      if (exposedVariants.has(exposureKey)) {
        return
      }

      setExposedVariants((prev) => new Set(prev).add(exposureKey))

      // Call exposure callback
      if (onExposure) {
        onExposure(experimentId, variantId, {
          ...metadata,
          userId,
          timestamp: new Date().toISOString(),
          path: pathname,
        })
      }

      // Default analytics tracking
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('experiment_viewed', {
          experiment_id: experimentId,
          variant_id: variantId,
          user_id: userId,
          ...metadata,
        })
      }
    },
    [getVariant, exposedVariants, onExposure, userId, pathname]
  )

  // Check if user is in a specific variant
  const isInVariant = useCallback(
    (experimentId: string, variantId: string): boolean => {
      const assignment = assignments.get(experimentId)
      return assignment ? assignment.variantId === variantId : false
    },
    [assignments]
  )

  // Refresh experiments from Edge Config
  const refreshExperiments = useCallback(async () => {
    setIsLoading(true)
    try {
      const updatedExperiments = await fetchExperiments(true)
      setExperiments(updatedExperiments)
    } catch (error) {
      console.error('Failed to refresh experiments:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const contextValue: ABTestContextValue = useMemo(
    () => ({
      experiments,
      assignments,
      getVariant,
      trackExposure,
      isInVariant,
      refreshExperiments,
    }),
    [
      experiments,
      assignments,
      getVariant,
      trackExposure,
      isInVariant,
      refreshExperiments,
    ]
  )

  // Don't render children until experiments are loaded
  if (isLoading) {
    return null // Or a loading spinner
  }

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  )
}

/**
 * Hook to access A/B testing context
 * @throws Error if used outside of ABTestProvider
 */
export function useABTest(): ABTestContextValue {
  const context = useContext(ABTestContext)

  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider')
  }

  return context
}

// Type augmentation for window.analytics
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, any>) => void
    }
  }
}
