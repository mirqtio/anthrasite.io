/**
 * Tests for A/B Testing React Hooks
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import {
  useExperiment,
  useVariant,
  useExperimentDetails,
  useVariantConfig,
  useExperimentTracking,
  useMultiVariant,
  useActiveExperiments,
} from '../hooks'
import { ABTestProvider } from '../../context/ABTestingContext'
import { Experiment } from '../types'

// Mock analytics
const mockAnalytics = {
  track: jest.fn(),
}

// Mock experiments
const mockExperiments = new Map<string, Experiment>([
  [
    'test-exp',
    {
      id: 'test-exp',
      name: 'Test Experiment',
      status: 'active',
      variants: [
        { id: 'control', name: 'Control', weight: 50 },
        {
          id: 'variant-a',
          name: 'Variant A',
          weight: 50,
          config: { color: 'blue', size: 'large' },
        },
      ],
    },
  ],
  [
    'multi-variant',
    {
      id: 'multi-variant',
      name: 'Multi Variant Test',
      status: 'active',
      variants: [
        { id: 'a', name: 'A', weight: 33 },
        { id: 'b', name: 'B', weight: 33 },
        { id: 'c', name: 'C', weight: 34 },
      ],
    },
  ],
])

// Test wrapper component
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ABTestProvider
    userId="test-user-123"
    initialExperiments={mockExperiments}
    onExposure={jest.fn()}
  >
    {children}
  </ABTestProvider>
)

describe('A/B Testing Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up window.analytics mock
    Object.defineProperty(window, 'analytics', {
      value: mockAnalytics,
      writable: true,
      configurable: true,
    })
  })

  describe('useExperiment', () => {
    it('should return variant ID for active experiment', () => {
      const { result } = renderHook(() => useExperiment('test-exp'), {
        wrapper,
      })

      expect(result.current).toBeTruthy()
      expect(['control', 'variant-a']).toContain(result.current)
    })

    it('should return consistent variant for same user', () => {
      const { result: result1 } = renderHook(() => useExperiment('test-exp'), {
        wrapper,
      })
      const { result: result2 } = renderHook(() => useExperiment('test-exp'), {
        wrapper,
      })

      expect(result1.current).toBe(result2.current)
    })

    it('should track exposure on mount when enabled', () => {
      const onExposure = jest.fn()
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider
          userId="test-user-123"
          initialExperiments={mockExperiments}
          onExposure={onExposure}
        >
          {children}
        </ABTestProvider>
      )

      renderHook(() => useExperiment('test-exp', true), {
        wrapper: CustomWrapper,
      })

      expect(onExposure).toHaveBeenCalledWith(
        'test-exp',
        expect.any(String),
        expect.objectContaining({
          userId: 'test-user-123',
        })
      )
    })

    it('should not track exposure when disabled', () => {
      const onExposure = jest.fn()
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider
          userId="test-user-123"
          initialExperiments={mockExperiments}
          onExposure={onExposure}
        >
          {children}
        </ABTestProvider>
      )

      renderHook(() => useExperiment('test-exp', false), {
        wrapper: CustomWrapper,
      })

      expect(onExposure).not.toHaveBeenCalled()
    })
  })

  describe('useVariant', () => {
    it('should return true when user is in specified variant', () => {
      // Force a specific variant for testing
      const userId = 'user-in-control' // This should hash to control
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider
          userId={userId}
          initialExperiments={mockExperiments}
          onExposure={jest.fn()}
        >
          {children}
        </ABTestProvider>
      )

      const { result } = renderHook(
        () => {
          const variant = useExperiment('test-exp')
          const isInVariant = useVariant('test-exp', variant || '')
          return { variant, isInVariant }
        },
        { wrapper: CustomWrapper }
      )

      expect(result.current.isInVariant).toBe(true)
    })

    it('should return false when user is not in specified variant', () => {
      const { result } = renderHook(
        () => {
          const variant = useExperiment('test-exp')
          const oppositeVariant =
            variant === 'control' ? 'variant-a' : 'control'
          return useVariant('test-exp', oppositeVariant)
        },
        { wrapper }
      )

      expect(result.current).toBe(false)
    })
  })

  describe('useExperimentDetails', () => {
    it('should return full experiment details', () => {
      const { result } = renderHook(() => useExperimentDetails('test-exp'), {
        wrapper,
      })

      expect(result.current).toEqual(mockExperiments.get('test-exp'))
    })

    it('should return null for non-existent experiment', () => {
      const { result } = renderHook(
        () => useExperimentDetails('non-existent'),
        { wrapper }
      )

      expect(result.current).toBeNull()
    })
  })

  describe('useVariantConfig', () => {
    it('should return config for assigned variant', () => {
      // Force variant-a which has config
      const userId = 'user-for-variant-a'
      const CustomWrapper = ({ children }: { children: React.ReactNode }) => (
        <ABTestProvider
          userId={userId}
          initialExperiments={mockExperiments}
          onExposure={jest.fn()}
        >
          {children}
        </ABTestProvider>
      )

      const { result } = renderHook(
        () => {
          const variant = useExperiment('test-exp')
          const config = useVariantConfig<{ color: string; size: string }>(
            'test-exp'
          )
          return { variant, config }
        },
        { wrapper: CustomWrapper }
      )

      if (result.current.variant === 'variant-a') {
        expect(result.current.config).toEqual({
          color: 'blue',
          size: 'large',
        })
      } else {
        expect(result.current.config).toBeNull()
      }
    })
  })

  describe('useExperimentTracking', () => {
    it('should provide tracking functions', () => {
      const { result } = renderHook(() => useExperimentTracking('test-exp'), {
        wrapper,
      })

      expect(result.current.variantId).toBeTruthy()
      expect(result.current.trackEvent).toBeInstanceOf(Function)
      expect(result.current.trackConversion).toBeInstanceOf(Function)
      expect(result.current.trackExposure).toBeInstanceOf(Function)
    })

    it('should track custom events with experiment context', () => {
      const { result } = renderHook(() => useExperimentTracking('test-exp'), {
        wrapper,
      })

      act(() => {
        result.current.trackEvent('button_clicked', { button: 'cta' })
      })

      expect(mockAnalytics.track).toHaveBeenCalledWith('button_clicked', {
        experiment_id: 'test-exp',
        variant_id: result.current.variantId,
        button: 'cta',
      })
    })

    it('should track conversions', () => {
      const { result } = renderHook(() => useExperimentTracking('test-exp'), {
        wrapper,
      })

      act(() => {
        result.current.trackConversion(99.99, { product: 'premium' })
      })

      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'experiment_conversion',
        {
          experiment_id: 'test-exp',
          variant_id: result.current.variantId,
          conversion_value: 99.99,
          product: 'premium',
        }
      )
    })
  })

  describe('useMultiVariant', () => {
    it('should render correct content based on variant', () => {
      const variants = {
        a: () => 'Content A',
        b: () => 'Content B',
        c: () => 'Content C',
      }

      const { result } = renderHook(
        () => useMultiVariant('multi-variant', variants, () => 'Default'),
        { wrapper }
      )

      expect(['Content A', 'Content B', 'Content C']).toContain(result.current)
    })

    it('should render default content for non-existent experiment', () => {
      const variants = {
        a: () => 'Content A',
        b: () => 'Content B',
      }

      const { result } = renderHook(
        () => useMultiVariant('non-existent', variants, () => 'Default'),
        { wrapper }
      )

      expect(result.current).toBe('Default')
    })
  })

  describe('useActiveExperiments', () => {
    it('should return list of active experiments', () => {
      const { result } = renderHook(() => useActiveExperiments(), {
        wrapper,
      })

      expect(result.current).toContain('test-exp')
      expect(result.current).toContain('multi-variant')
      expect(result.current).toHaveLength(2)
    })
  })
})
