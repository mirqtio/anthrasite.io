import { renderHook, act } from '@testing-library/react'
import { 
  useAnalytics, 
  usePageTracking, 
  useEventTracking,
  useWebVitals
} from '../hooks'
import { trackEvent, trackPageView } from '../analytics-client'
import { usePathname } from 'next/navigation'

// Mock dependencies
jest.mock('../analytics-client', () => ({
  trackEvent: jest.fn(),
  trackPageView: jest.fn(),
  identifyUser: jest.fn(),
  resetUser: jest.fn()
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFID: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
  onINP: jest.fn()
}))

describe('Analytics Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useAnalytics', () => {
    it('should provide analytics functions', () => {
      const { result } = renderHook(() => useAnalytics())

      expect(result.current).toHaveProperty('track')
      expect(result.current).toHaveProperty('page')
      expect(result.current).toHaveProperty('identify')
      expect(result.current).toHaveProperty('reset')
    })

    it('should track events', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.track('test_event', { value: 100 })
      })

      expect(trackEvent).toHaveBeenCalledWith('test_event', { value: 100 })
    })

    it('should track page views', () => {
      const { result } = renderHook(() => useAnalytics())

      act(() => {
        result.current.page({ path: '/test' })
      })

      expect(trackPageView).toHaveBeenCalledWith({ path: '/test' })
    })
  })

  describe('usePageTracking', () => {
    it('should track page view on mount', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/test-page')

      renderHook(() => usePageTracking())

      expect(trackPageView).toHaveBeenCalledWith({
        path: '/test-page',
        title: expect.any(String)
      })
    })

    it('should track page view when pathname changes', () => {
      const mockUsePathname = usePathname as jest.Mock
      mockUsePathname.mockReturnValue('/initial')

      const { rerender } = renderHook(() => usePageTracking())

      expect(trackPageView).toHaveBeenCalledTimes(1)

      // Change pathname
      mockUsePathname.mockReturnValue('/new-page')
      rerender()

      expect(trackPageView).toHaveBeenCalledTimes(2)
      expect(trackPageView).toHaveBeenLastCalledWith({
        path: '/new-page',
        title: expect.any(String)
      })
    })

    it('should not track if pathname is null', () => {
      ;(usePathname as jest.Mock).mockReturnValue(null)

      renderHook(() => usePageTracking())

      expect(trackPageView).not.toHaveBeenCalled()
    })
  })

  describe('useEventTracking', () => {
    it('should return track function', () => {
      const { result } = renderHook(() => useEventTracking())

      expect(typeof result.current).toBe('function')
    })

    it('should track events with proper parameters', () => {
      const { result } = renderHook(() => useEventTracking())

      act(() => {
        result.current('button_click', { button_id: 'submit' })
      })

      expect(trackEvent).toHaveBeenCalledWith('button_click', { button_id: 'submit' })
    })

    it('should memoize track function', () => {
      const { result, rerender } = renderHook(() => useEventTracking())

      const trackFn1 = result.current
      rerender()
      const trackFn2 = result.current

      expect(trackFn1).toBe(trackFn2)
    })
  })

  describe('useWebVitals', () => {
    it('should track web vitals on mount', () => {
      const mockOnCLS = require('web-vitals').onCLS
      const mockOnLCP = require('web-vitals').onLCP
      const mockOnFID = require('web-vitals').onFID
      const mockOnFCP = require('web-vitals').onFCP
      const mockOnTTFB = require('web-vitals').onTTFB
      const mockOnINP = require('web-vitals').onINP

      renderHook(() => useWebVitals())

      expect(mockOnCLS).toHaveBeenCalled()
      expect(mockOnLCP).toHaveBeenCalled()
      expect(mockOnFID).toHaveBeenCalled()
      expect(mockOnFCP).toHaveBeenCalled()
      expect(mockOnTTFB).toHaveBeenCalled()
      expect(mockOnINP).toHaveBeenCalled()
    })

    it('should track CLS metric', () => {
      const mockOnCLS = require('web-vitals').onCLS
      let clsCallback: any

      mockOnCLS.mockImplementation((cb: any) => {
        clsCallback = cb
      })

      renderHook(() => useWebVitals())

      act(() => {
        clsCallback({ name: 'CLS', value: 0.1, id: 'cls-1' })
      })

      expect(trackEvent).toHaveBeenCalledWith('web_vitals', {
        metric_name: 'CLS',
        metric_value: 0.1,
        metric_id: 'cls-1'
      })
    })

    it('should track all web vitals metrics', () => {
      const webVitals = require('web-vitals')
      const callbacks: Record<string, any> = {}

      Object.keys(webVitals).forEach(key => {
        if (key.startsWith('on')) {
          webVitals[key].mockImplementation((cb: any) => {
            callbacks[key] = cb
          })
        }
      })

      renderHook(() => useWebVitals())

      // Simulate each metric
      const metrics = [
        { fn: 'onCLS', name: 'CLS', value: 0.1 },
        { fn: 'onLCP', name: 'LCP', value: 2500 },
        { fn: 'onFID', name: 'FID', value: 100 },
        { fn: 'onFCP', name: 'FCP', value: 1800 },
        { fn: 'onTTFB', name: 'TTFB', value: 800 },
        { fn: 'onINP', name: 'INP', value: 200 }
      ]

      metrics.forEach(metric => {
        act(() => {
          callbacks[metric.fn]({ 
            name: metric.name, 
            value: metric.value, 
            id: `${metric.name}-1` 
          })
        })
      })

      expect(trackEvent).toHaveBeenCalledTimes(6)
    })
  })
})