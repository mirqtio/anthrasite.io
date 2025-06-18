import {
  trackServerEvent,
  trackPurchaseComplete,
  trackEmailEvent,
  trackWebhookEvent,
  trackApiEvent,
} from '../analytics-server'

// Mock environment variables
const originalEnv = process.env

// Mock fetch
global.fetch = jest.fn()

// Mock console
const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

describe('Analytics Server', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      GA4_API_SECRET: 'test-secret',
      NEXT_PUBLIC_GA4_MEASUREMENT_ID: 'G-TEST123',
      POSTHOG_API_KEY: 'phc_test123',
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

  describe('trackServerEvent', () => {
    it('should send event to GA4 measurement protocol', async () => {
      await trackServerEvent('test_event', {
        client_id: 'test-client',
        user_id: 'test-user',
        value: 100,
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('google-analytics.com/mp/collect'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('test_event'),
        })
      )
    })

    it('should send event to PostHog', async () => {
      await trackServerEvent('test_event', {
        client_id: 'test-client',
        user_id: 'test-user',
        value: 100,
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('posthog.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Bearer'),
          }),
        })
      )
    })

    it('should handle missing environment variables', async () => {
      delete process.env.GA4_API_SECRET
      delete process.env.POSTHOG_API_KEY

      await trackServerEvent('test_event', { client_id: 'test' })

      expect(fetch).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Server analytics not configured properly'
      )
    })

    it('should handle fetch errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await trackServerEvent('test_event', { client_id: 'test' })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to send server analytics:',
        expect.any(Error)
      )
    })
  })

  describe('trackPurchaseComplete', () => {
    it('should track purchase with proper event structure', async () => {
      await trackPurchaseComplete({
        sessionId: 'cs_test_123',
        amount: 9900,
        currency: 'USD',
        businessId: 'biz_123',
        businessName: 'Test Business',
        domain: 'testbusiness.com',
        customerEmail: 'test@example.com',
      })

      const callArgs = (fetch as jest.Mock).mock.calls[0]
      const body = JSON.parse(callArgs[1].body)

      expect(body.events[0]).toMatchObject({
        name: 'purchase',
        params: expect.objectContaining({
          transaction_id: 'cs_test_123',
          value: 99,
          currency: 'USD',
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: 'website_audit',
              price: 99,
            }),
          ]),
        }),
      })
    })

    it('should include business metadata', async () => {
      await trackPurchaseComplete({
        sessionId: 'cs_test_123',
        amount: 9900,
        currency: 'USD',
        businessId: 'biz_123',
        businessName: 'Test Business',
        domain: 'testbusiness.com',
        customerEmail: 'test@example.com',
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('Test Business'),
        })
      )
    })
  })

  describe('trackEmailEvent', () => {
    it('should track email open event', async () => {
      await trackEmailEvent('email_opened', {
        email_id: 'email_123',
        recipient: 'test@example.com',
        campaign: 'purchase_confirmation',
      })

      expect(fetch).toHaveBeenCalled()
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.events[0].name).toBe('email_opened')
    })

    it('should track email click event', async () => {
      await trackEmailEvent('email_clicked', {
        email_id: 'email_123',
        recipient: 'test@example.com',
        link: 'https://example.com/report',
      })

      expect(fetch).toHaveBeenCalled()
    })
  })

  describe('trackWebhookEvent', () => {
    it('should track webhook received', async () => {
      await trackWebhookEvent('stripe_webhook', {
        event_type: 'checkout.session.completed',
        event_id: 'evt_123',
      })

      expect(fetch).toHaveBeenCalled()
      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.events[0].name).toBe('webhook_received')
    })

    it('should include webhook metadata', async () => {
      await trackWebhookEvent('sendgrid_webhook', {
        event_type: 'delivered',
        email_id: 'email_123',
      })

      const callArgs = (fetch as jest.Mock).mock.calls[0]
      expect(callArgs[1].body).toContain('sendgrid_webhook')
      expect(callArgs[1].body).toContain('delivered')
    })
  })

  describe('trackApiEvent', () => {
    it('should track API request', async () => {
      await trackApiEvent('api_request', {
        endpoint: '/api/waitlist',
        method: 'POST',
        status: 200,
        duration: 123,
      })

      expect(fetch).toHaveBeenCalled()
    })

    it('should track API errors', async () => {
      await trackApiEvent('api_error', {
        endpoint: '/api/stripe/webhook',
        method: 'POST',
        status: 400,
        error: 'Invalid signature',
      })

      const body = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body)
      expect(body.events[0].params.error_message).toBe('Invalid signature')
    })
  })

  describe('environment handling', () => {
    it('should not track in test environment', async () => {
      process.env.NODE_ENV = 'test'

      await trackServerEvent('test_event', { client_id: 'test' })

      expect(fetch).not.toHaveBeenCalled()
    })

    it('should track in production environment', async () => {
      process.env.NODE_ENV = 'production'

      await trackServerEvent('test_event', { client_id: 'test' })

      expect(fetch).toHaveBeenCalled()
    })
  })
})
