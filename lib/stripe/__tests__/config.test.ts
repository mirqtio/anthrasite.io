import {
  getStripe,
  validateStripeConfig,
  REPORT_PRICE,
  getStripeUrls,
} from '../config'

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    // Mock Stripe instance
  }))
})

describe('Stripe Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('getStripe', () => {
    it('should create and return stripe instance when secret key is available', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'

      const stripe = getStripe()
      expect(stripe).toBeDefined()

      // Should return the same instance on subsequent calls
      const stripe2 = getStripe()
      expect(stripe2).toBe(stripe)
    })

    it('should throw error when STRIPE_SECRET_KEY is not defined', () => {
      delete process.env.STRIPE_SECRET_KEY

      expect(() => getStripe()).toThrow('STRIPE_SECRET_KEY is not defined')
    })
  })

  describe('REPORT_PRICE', () => {
    it('should have correct price configuration', () => {
      expect(REPORT_PRICE).toEqual({
        amount: 9900,
        currency: 'usd',
        productName: 'Website Audit Report',
        productDescription: expect.stringContaining(
          'Comprehensive 50+ page website audit report'
        ),
      })
    })
  })

  describe('getStripeUrls', () => {
    it('should return correct URLs for given base URL', () => {
      const baseUrl = 'https://example.com'
      const urls = getStripeUrls(baseUrl)

      expect(urls).toEqual({
        successUrl:
          'https://example.com/purchase/success?session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'https://example.com/purchase/cancel',
        webhookUrl: 'https://example.com/api/stripe/webhook',
      })
    })
  })

  describe('validateStripeConfig', () => {
    it('should not throw when all required keys are present', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

      expect(() => validateStripeConfig()).not.toThrow()
    })

    it('should throw when STRIPE_SECRET_KEY is missing', () => {
      delete process.env.STRIPE_SECRET_KEY
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123'
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

      expect(() => validateStripeConfig()).toThrow(
        'Missing required Stripe environment variables: STRIPE_SECRET_KEY'
      )
    })

    it('should throw when STRIPE_WEBHOOK_SECRET is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      delete process.env.STRIPE_WEBHOOK_SECRET
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123'

      expect(() => validateStripeConfig()).toThrow(
        'Missing required Stripe environment variables: STRIPE_WEBHOOK_SECRET'
      )
    })

    it('should throw when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123'
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123'
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      expect(() => validateStripeConfig()).toThrow(
        'Missing required Stripe environment variables: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
      )
    })

    it('should throw when multiple keys are missing', () => {
      delete process.env.STRIPE_SECRET_KEY
      delete process.env.STRIPE_WEBHOOK_SECRET
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      expect(() => validateStripeConfig()).toThrow(
        'Missing required Stripe environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
      )
    })
  })
})
