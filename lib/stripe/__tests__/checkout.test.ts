import {
  createCheckoutSession,
  retrieveSession,
  isSessionPaid,
} from '../checkout'
import { stripe } from '../config'
import { LRUCache } from 'lru-cache'

// Mock Stripe
jest.mock('../config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
  },
  REPORT_PRICE: {
    amount: 9900,
    currency: 'usd',
    productName: 'Website Audit Report',
    productDescription: 'Test description',
  },
  getStripeUrls: jest.fn(() => ({
    successUrl:
      'http://localhost:3000/purchase/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: 'http://localhost:3000/purchase/cancel',
  })),
}))

// Mock LRU Cache
jest.mock('lru-cache', () => {
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  }
  return {
    LRUCache: jest.fn(() => mockCache),
    __getMockCache: () => mockCache,
  }
})

describe('Stripe Checkout Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCheckoutSession', () => {
    it('should create a checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
        amount_total: 9900,
      }

      ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
        mockSession
      )

      const result = await createCheckoutSession({
        businessId: 'business-123',
        utmToken: 'utm-token-123',
        customerEmail: 'test@example.com',
        baseUrl: 'http://localhost:3000',
      })

      expect(result).toEqual(mockSession)
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Website Audit Report',
                description: 'Test description',
              },
              unit_amount: 9900,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url:
          'http://localhost:3000/purchase/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'http://localhost:3000/purchase/cancel',
        customer_email: 'test@example.com',
        metadata: {
          businessId: 'business-123',
          utmToken: 'utm-token-123',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        submit_type: 'pay',
        expires_at: expect.any(Number),
      })
    })

    it('should handle errors gracefully', async () => {
      const error = new Error('Stripe API error')
      ;(stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(error)

      await expect(
        createCheckoutSession({
          businessId: 'business-123',
          utmToken: 'utm-token-123',
          baseUrl: 'http://localhost:3000',
        })
      ).rejects.toThrow('Failed to create checkout session')
    })
  })

  describe('retrieveSession', () => {
    let mockCache: any

    beforeEach(() => {
      // Get the mock cache instance
      const lruCache = require('lru-cache')
      mockCache = lruCache.__getMockCache()
      mockCache.get.mockClear()
      mockCache.set.mockClear()
    })

    it('should retrieve session from cache if available', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
      }

      mockCache.get.mockReturnValue(mockSession)

      const result = await retrieveSession('cs_test_123')

      expect(result).toEqual(mockSession)
      expect(mockCache.get).toHaveBeenCalledWith('cs_test_123')
      expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled()
    })

    it('should fetch from Stripe if not in cache', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
      }

      mockCache.get.mockReturnValue(null)
      ;(stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue(
        mockSession
      )

      const result = await retrieveSession('cs_test_123')

      expect(result).toEqual(mockSession)
      expect(stripe.checkout.sessions.retrieve).toHaveBeenCalledWith(
        'cs_test_123',
        {
          expand: ['payment_intent', 'customer'],
        }
      )
      expect(mockCache.set).toHaveBeenCalledWith('cs_test_123', mockSession)
    })

    it('should return null on error', async () => {
      const mockCache = {
        get: jest.fn().mockReturnValue(null),
        set: jest.fn(),
      }

      ;(LRUCache as jest.Mock).mockImplementation(() => mockCache)
      ;(stripe.checkout.sessions.retrieve as jest.Mock).mockRejectedValue(
        new Error('Not found')
      )

      const result = await retrieveSession('cs_test_123')

      expect(result).toBeNull()
    })
  })

  describe('isSessionPaid', () => {
    it('should return true for paid sessions', () => {
      const session = { payment_status: 'paid' } as any
      expect(isSessionPaid(session)).toBe(true)
    })

    it('should return false for unpaid sessions', () => {
      const session = { payment_status: 'unpaid' } as any
      expect(isSessionPaid(session)).toBe(false)
    })
  })
})
