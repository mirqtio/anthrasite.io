import {
  trackEvent,
  trackPurchase,
  trackEmailSent,
  trackError,
  trackFunnelStep,
} from '../analytics-server'

// Mock environment variables
const originalEnv = process.env

// Mock fetch
global.fetch = jest.fn()

// Mock PostHog
const mockPostHog = {
  capture: jest.fn(),
  shutdown: jest.fn(),
}

jest.mock('posthog-node', () => ({
  PostHog: jest.fn(() => mockPostHog),
}))

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn((name: string) => {
      if (name === '_ga_client_id') return { value: 'test-client-id' }
      if (name === 'posthog_distinct_id') return { value: 'test-distinct-id' }
      return undefined
    }),
  })),
}))

// Mock console
const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

describe('Analytics Server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPostHog.capture.mockClear()
    mockPostHog.shutdown.mockClear()
    process.env = {
      ...originalEnv,
      GA4_API_SECRET: 'test-secret',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEST123',
      NEXT_PUBLIC_POSTHOG_KEY: 'phc_test123',
    }
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  describe('trackEvent', () => {
    it('should send event to GA4 measurement protocol', async () => {
      await trackEvent('test_event', {
        client_id: 'test-client',
        user_id: 'test-user',
        value: 100,
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('google-analytics.com/mp/collect'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test_event'),
        })
      )
    })

    it('should send event to PostHog', async () => {
      await trackEvent('test_event', {
        client_id: 'test-client',
        user_id: 'test-user',
        value: 100,
      })

      expect(mockPostHog.capture).toHaveBeenCalledWith({
        distinctId: expect.any(String),
        event: 'test_event',
        properties: {
          client_id: 'test-client',
          user_id: 'test-user',
          value: 100,
        },
      })
      expect(mockPostHog.shutdown).toHaveBeenCalled()
    })

    it('should handle missing environment variables', async () => {
      delete process.env.GA4_API_SECRET
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY

      await trackEvent('test_event', { client_id: 'test' })

      expect(fetch).not.toHaveBeenCalled()
      expect(mockPostHog.capture).not.toHaveBeenCalled()
    })

    it('should handle fetch errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await trackEvent('test_event', { client_id: 'test' })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Server-side analytics error:',
        expect.any(Error)
      )
    })
  })

  describe('trackPurchase', () => {
    it('should track purchase with proper event structure', async () => {
      await trackPurchase('cs_test_123', 99, 'USD', {
        business_id: 'biz_123',
        business_name: 'Test Business',
        domain: 'testbusiness.com',
        customer_email: 'test@example.com',
      })

      const callArgs = (fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body.events[0]).toMatchObject({
        name: 'purchase',
        params: expect.objectContaining({
          transaction_id: 'cs_test_123',
          value: 99,
          currency: 'USD',
        }),
      })
    })

    it('should include business metadata', async () => {
      await trackPurchase('cs_test_123', 99, 'USD', {
        business_id: 'biz_123',
        business_name: 'Test Business',
        domain: 'testbusiness.com',
        customer_email: 'test@example.com',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Test Business'),
        })
      )
    })
  })

  describe('trackEmailSent', () => {
    it('should track email sent event', async () => {
      await trackEmailSent('purchase_confirmation', 'test@example.com', true, {
        email_id: 'email_123',
        campaign: 'purchase_confirmation',
      })

      expect(fetch).toHaveBeenCalled()
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.events[0].name).toBe('email_sent')
    })

    it('should track email failure event', async () => {
      await trackEmailSent('purchase_confirmation', 'test@example.com', false, {
        email_id: 'email_123',
        error: 'bounce',
      })

      expect(fetch).toHaveBeenCalled()
    })
  })

  describe('trackError', () => {
    it('should track error events', async () => {
      await trackError('stripe_webhook', 'checkout.session.completed failed', {
        event_id: 'evt_123',
      })

      expect(fetch).toHaveBeenCalled()
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.events[0].name).toBe('error')
    })

    it('should include error metadata', async () => {
      await trackError('sendgrid_webhook', 'delivery failed', {
        email_id: 'email_123',
      })

      const callArgs = (fetch as jest.Mock).mock.calls[0]
      expect(callArgs[1].body).toContain('sendgrid_webhook')
      expect(callArgs[1].body).toContain('delivery failed')
    })
  })

  describe('trackFunnelStep', () => {
    it('should track funnel step', async () => {
      await trackFunnelStep('main_purchase', 1, 'homepage_view', {
        entry_point: 'organic',
      })

      expect(fetch).toHaveBeenCalled()
    })

    it('should track funnel progression', async () => {
      await trackFunnelStep('main_purchase', 2, 'utm_validated', {
        business_id: 'biz_123',
      })

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.events[0].params.funnel_name).toBe('main_purchase')
      expect(body.events[0].params.funnel_step).toBe(2)
    })
  })

  describe('environment handling', () => {
    it('should track events with environment variables', async () => {
      process.env.NODE_ENV = 'production'

      await trackEvent('test_event', { client_id: 'test' })

      expect(fetch).toHaveBeenCalled()
    })

    it('should handle missing environment gracefully', async () => {
      delete process.env.GA4_API_SECRET
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY

      await trackEvent('test_event', { client_id: 'test' })

      // Should not throw errors, just not track
      expect(fetch).not.toHaveBeenCalled()
    })
  })
})
