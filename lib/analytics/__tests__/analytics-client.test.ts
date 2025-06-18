import {
  trackEvent,
  trackPageView,
  identifyUser,
  resetUser,
  trackPurchase,
  trackFunnelStep,
  trackWebVitals,
  getFeatureFlag,
  isFeatureEnabled,
} from '../analytics-client'
import { getAnalytics } from '../analytics-manager'

// Mock the analytics manager module
jest.mock('../analytics-manager', () => ({
  getAnalytics: jest.fn(),
}))

describe('Analytics Client', () => {
  let mockAnalyticsManager: any
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()

    // Create mock analytics manager
    mockAnalyticsManager = {
      track: jest.fn(),
      page: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn(),
      trackPurchase: jest.fn(),
      trackFunnelStep: jest.fn(),
      getFeatureFlag: jest.fn(),
      isFeatureEnabled: jest.fn(),
    }
    ;(getAnalytics as jest.Mock).mockReturnValue(mockAnalyticsManager)

    // Spy on console.warn
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('trackEvent', () => {
    it('should track event when analytics is available', () => {
      trackEvent('test_event', { value: 100 })

      expect(mockAnalyticsManager.track).toHaveBeenCalledWith('test_event', {
        value: 100,
      })
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('should not throw when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      expect(() => trackEvent('test_event')).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('trackPageView', () => {
    it('should track page view when analytics is available', () => {
      trackPageView({ path: '/test', title: 'Test Page' })

      expect(mockAnalyticsManager.page).toHaveBeenCalledWith({
        path: '/test',
        title: 'Test Page',
      })
    })

    it('should not throw when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      expect(() => trackPageView()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('identifyUser', () => {
    it('should identify user when analytics is available', () => {
      identifyUser('user123', { email: 'test@example.com' })

      expect(mockAnalyticsManager.identify).toHaveBeenCalledWith('user123', {
        email: 'test@example.com',
      })
    })

    it('should not throw when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      expect(() => identifyUser('user123')).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('resetUser', () => {
    it('should reset user when analytics is available', () => {
      resetUser()

      expect(mockAnalyticsManager.reset).toHaveBeenCalled()
    })

    it('should not throw when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      expect(() => resetUser()).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('trackPurchase', () => {
    it('should track purchase when analytics is available', () => {
      trackPurchase('order123', 99.99, 'USD', { product: 'audit' })

      expect(mockAnalyticsManager.trackPurchase).toHaveBeenCalledWith(
        'order123',
        99.99,
        'USD',
        { product: 'audit' }
      )
    })

    it('should use default currency USD', () => {
      trackPurchase('order123', 99.99)

      expect(mockAnalyticsManager.trackPurchase).toHaveBeenCalledWith(
        'order123',
        99.99,
        'USD',
        undefined
      )
    })

    it('should not throw when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      expect(() => trackPurchase('order123', 99.99)).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('trackFunnelStep', () => {
    it('should track funnel step when analytics is available', () => {
      trackFunnelStep('checkout', 2, 'payment', { value: 99 })

      expect(mockAnalyticsManager.trackFunnelStep).toHaveBeenCalledWith(
        'checkout',
        2,
        'payment',
        { value: 99 }
      )
    })

    it('should not throw when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      expect(() => trackFunnelStep('checkout', 1, 'start')).not.toThrow()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('trackWebVitals', () => {
    it('should track web vitals metrics', () => {
      trackWebVitals({
        CLS: 0.1,
        FID: 100,
        LCP: 2500,
        TTFB: 800,
      })

      expect(mockAnalyticsManager.track).toHaveBeenCalledTimes(4)
      expect(mockAnalyticsManager.track).toHaveBeenCalledWith('web_vitals', {
        metric_name: 'CLS',
        metric_value: 0.1,
      })
      expect(mockAnalyticsManager.track).toHaveBeenCalledWith('web_vitals', {
        metric_name: 'FID',
        metric_value: 100,
      })
      expect(mockAnalyticsManager.track).toHaveBeenCalledWith('web_vitals', {
        metric_name: 'LCP',
        metric_value: 2500,
      })
      expect(mockAnalyticsManager.track).toHaveBeenCalledWith('web_vitals', {
        metric_name: 'TTFB',
        metric_value: 800,
      })
    })

    it('should skip undefined metrics', () => {
      trackWebVitals({
        CLS: 0.1,
        FID: undefined,
        LCP: 2500,
      })

      expect(mockAnalyticsManager.track).toHaveBeenCalledTimes(2)
      expect(mockAnalyticsManager.track).not.toHaveBeenCalledWith(
        'web_vitals',
        {
          metric_name: 'FID',
          metric_value: undefined,
        }
      )
    })

    it('should handle empty metrics object', () => {
      trackWebVitals({})

      expect(mockAnalyticsManager.track).not.toHaveBeenCalled()
    })
  })

  describe('getFeatureFlag', () => {
    it('should get feature flag value when analytics is available', () => {
      mockAnalyticsManager.getFeatureFlag.mockReturnValue('variant-a')

      const result = getFeatureFlag('test-flag')

      expect(result).toBe('variant-a')
      expect(mockAnalyticsManager.getFeatureFlag).toHaveBeenCalledWith(
        'test-flag'
      )
    })

    it('should return undefined when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      const result = getFeatureFlag('test-flag')

      expect(result).toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })

  describe('isFeatureEnabled', () => {
    it('should check if feature is enabled when analytics is available', () => {
      mockAnalyticsManager.isFeatureEnabled.mockReturnValue(true)

      const result = isFeatureEnabled('test-feature')

      expect(result).toBe(true)
      expect(mockAnalyticsManager.isFeatureEnabled).toHaveBeenCalledWith(
        'test-feature'
      )
    })

    it('should return false when analytics is not available', () => {
      ;(getAnalytics as jest.Mock).mockReturnValue(null)

      const result = isFeatureEnabled('test-feature')

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Analytics not initialized')
    })
  })
})
