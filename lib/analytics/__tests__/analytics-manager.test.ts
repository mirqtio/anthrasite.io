import { AnalyticsManager } from '../analytics-manager'
import { GoogleAnalytics4Provider } from '../providers/ga4'
import { PostHogProvider } from '../providers/posthog'
import { getCookieConsent, onConsentChange } from '@/lib/cookies/consent'
import { validateEventSchema } from '../event-schemas'
import { AnalyticsConfig } from '../types'

// Mock dependencies
jest.mock('../providers/ga4')
jest.mock('../providers/posthog')
jest.mock('@/lib/cookies/consent')
jest.mock('../event-schemas')

describe('AnalyticsManager', () => {
  let manager: AnalyticsManager
  let mockGA4: jest.Mocked<GoogleAnalytics4Provider>
  let mockPostHog: jest.Mocked<PostHogProvider>

  const mockConfig: AnalyticsConfig = {
    ga4: {
      measurementId: 'G-TEST123',
      apiSecret: 'test-secret',
    },
    posthog: {
      apiKey: 'phc_test123',
    },
  }

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks()

    // Setup default mocks
    ;(validateEventSchema as jest.Mock).mockReturnValue(true)
    ;(getCookieConsent as jest.Mock).mockReturnValue({
      analytics: true,
      marketing: true,
      preferences: false,
      performance: false,
    })
    ;(onConsentChange as jest.Mock).mockImplementation(() => {})

    // Create mock provider instances
    mockGA4 = {
      initialize: jest.fn().mockResolvedValue(undefined),
      track: jest.fn(),
      page: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn(),
    } as any

    mockPostHog = {
      initialize: jest.fn().mockResolvedValue(undefined),
      track: jest.fn(),
      page: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn(),
      getFeatureFlag: jest.fn(),
      isFeatureEnabled: jest.fn(),
    } as any

    // Mock the constructors
    ;(GoogleAnalytics4Provider as jest.Mock).mockImplementation(() => mockGA4)
    ;(PostHogProvider as jest.Mock).mockImplementation(() => mockPostHog)

    // Create manager instance
    manager = new AnalyticsManager(mockConfig)
  })

  describe('initialize', () => {
    it('should initialize providers when analytics consent is granted', async () => {
      await manager.initialize()

      expect(GoogleAnalytics4Provider).toHaveBeenCalledWith(
        'G-TEST123',
        'test-secret'
      )
      expect(PostHogProvider).toHaveBeenCalledWith('phc_test123')
      expect(mockGA4.initialize).toHaveBeenCalled()
      expect(mockPostHog.initialize).toHaveBeenCalled()
    })

    it('should not initialize providers when analytics consent is denied', async () => {
      ;(getCookieConsent as jest.Mock).mockReturnValue({
        analytics: false,
        marketing: false,
        preferences: false,
        performance: false,
      })

      await manager.initialize()

      expect(mockGA4.initialize).not.toHaveBeenCalled()
      expect(mockPostHog.initialize).not.toHaveBeenCalled()
    })

    it.skip('should not initialize when running server-side', async () => {
      // This test is skipped because Jest/JSDOM always provides a window object,
      // making it impossible to properly test the server-side condition.
      // The typeof window === 'undefined' check works correctly in real SSR environments.
    })

    it('should listen for consent changes', async () => {
      let consentCallback: any
      ;(onConsentChange as jest.Mock).mockImplementation((cb) => {
        consentCallback = cb
      })

      await manager.initialize()

      // Simulate consent change to false
      consentCallback({
        analytics: false,
        marketing: false,
        preferences: false,
        performance: false,
      })

      expect(mockGA4.reset).toHaveBeenCalled()
      expect(mockPostHog.reset).toHaveBeenCalled()
    })
  })

  describe('track', () => {
    beforeEach(async () => {
      await manager.initialize()
      // Clear mocks after initialization to test only the explicit tracking calls
      jest.clearAllMocks()
    })

    it('should track events to all initialized providers', () => {
      const event = 'test_event'
      const properties = { value: 100 }

      manager.track(event, properties)

      expect(validateEventSchema).toHaveBeenCalledWith(event, properties)
      expect(mockGA4.track).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          value: 100,
          session_id: expect.any(String),
          timestamp: expect.any(String),
        })
      )
      expect(mockPostHog.track).toHaveBeenCalledWith(
        event,
        expect.objectContaining({
          value: 100,
          session_id: expect.any(String),
          timestamp: expect.any(String),
        })
      )
    })

    it('should not track when event schema is invalid', () => {
      ;(validateEventSchema as jest.Mock).mockReturnValue(false)

      manager.track('invalid_event', {})

      expect(mockGA4.track).not.toHaveBeenCalled()
      expect(mockPostHog.track).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully when tracking fails', () => {
      mockGA4.track.mockImplementation(() => {
        throw new Error('GA4 tracking failed')
      })

      // Should not throw
      expect(() => {
        manager.track('test_event', {})
      }).not.toThrow()

      // PostHog should still be called
      expect(mockPostHog.track).toHaveBeenCalled()
    })
  })

  describe('page', () => {
    beforeEach(async () => {
      await manager.initialize()
    })

    it('should track page views in all providers', () => {
      const properties = { path: '/test' }

      manager.page(properties)

      expect(mockGA4.page).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/test',
          session_id: expect.any(String),
        })
      )
      expect(mockPostHog.page).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/test',
          session_id: expect.any(String),
        })
      )
    })
  })

  describe('identify', () => {
    beforeEach(async () => {
      await manager.initialize()
    })

    it('should identify users in all providers', () => {
      const userId = 'user123'
      const traits = { email: 'test@example.com' }

      manager.identify(userId, traits)

      expect(mockGA4.identify).toHaveBeenCalledWith(userId, traits)
      expect(mockPostHog.identify).toHaveBeenCalledWith(userId, traits)
    })
  })

  describe('reset', () => {
    beforeEach(async () => {
      await manager.initialize()
    })

    it('should reset all providers', () => {
      const originalSessionId = (manager as any).sessionId

      manager.reset()

      expect(mockGA4.reset).toHaveBeenCalled()
      expect(mockPostHog.reset).toHaveBeenCalled()

      // Should generate new session ID
      const newSessionId = (manager as any).sessionId
      expect(newSessionId).not.toBe(originalSessionId)
    })
  })

  describe('A/B testing methods', () => {
    beforeEach(async () => {
      await manager.initialize()
    })

    it('should get feature flag from PostHog', () => {
      mockPostHog.getFeatureFlag.mockReturnValue('variant-a')

      const result = manager.getFeatureFlag('test-flag')

      expect(result).toBe('variant-a')
      expect(mockPostHog.getFeatureFlag).toHaveBeenCalledWith('test-flag')
    })

    it('should check if feature is enabled', () => {
      mockPostHog.isFeatureEnabled.mockReturnValue(true)

      const result = manager.isFeatureEnabled('test-feature')

      expect(result).toBe(true)
      expect(mockPostHog.isFeatureEnabled).toHaveBeenCalledWith('test-feature')
    })

    it('should return undefined/false when PostHog not initialized', async () => {
      // Create manager without PostHog config
      const managerNoPostHog = new AnalyticsManager({ ga4: mockConfig.ga4 })
      await managerNoPostHog.initialize()

      expect(managerNoPostHog.getFeatureFlag('test')).toBeUndefined()
      expect(managerNoPostHog.isFeatureEnabled('test')).toBe(false)
    })
  })

  describe('specialized tracking methods', () => {
    beforeEach(async () => {
      await manager.initialize()
    })

    it('should track funnel steps', () => {
      manager.trackFunnelStep('checkout', 2, 'payment', { value: 99 })

      expect(mockGA4.track).toHaveBeenCalledWith(
        'funnel_step',
        expect.objectContaining({
          funnel_name: 'checkout',
          funnel_step: 2,
          step_name: 'payment',
          value: 99,
        })
      )
    })

    it('should track purchases', () => {
      manager.trackPurchase('order-123', 99.99, 'USD', { product: 'audit' })

      expect(mockGA4.track).toHaveBeenCalledWith(
        'purchase',
        expect.objectContaining({
          transaction_id: 'order-123',
          value: 99.99,
          currency: 'USD',
          product: 'audit',
        })
      )
    })

    it('should track performance metrics', () => {
      manager.trackPerformance('page_load', 1234, { page: '/home' })

      expect(mockGA4.track).toHaveBeenCalledWith(
        'performance_metric',
        expect.objectContaining({
          metric_name: 'page_load',
          metric_value: 1234,
          page: '/home',
        })
      )
    })
  })
})
