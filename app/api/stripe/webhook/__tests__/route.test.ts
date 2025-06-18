// Mock lru-cache before importing the route
jest.mock('lru-cache', () => {
  const mockCacheInstance = {
    get: jest.fn(),
    set: jest.fn(),
  }
  return {
    LRUCache: jest.fn().mockImplementation(() => mockCacheInstance),
    __getMockInstance: () => mockCacheInstance,
  }
})

import { POST } from '../route'
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/db'

// Mock dependencies
jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  webhookSecret: 'test_webhook_secret',
}))

jest.mock('@/lib/db', () => ({
  prisma: {
    purchase: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    utmToken: {
      update: jest.fn(),
    },
    abandonedCheckout: {
      deleteMany: jest.fn(),
    },
    abandonedCart: {
      deleteMany: jest.fn(),
    },
    business: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/email/email-service', () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue({ success: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true }),
}))

jest.mock('@/lib/abandoned-cart/service', () => ({
  AbandonedCartService: jest.fn().mockImplementation(() => ({
    handlePaymentSuccess: jest.fn().mockResolvedValue({ success: true }),
    handleCheckoutAbandoned: jest.fn().mockResolvedValue({ success: true }),
  })),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name) => {
        if (name === 'stripe-signature') return 'test_signature'
        return null
      }),
    })
  ),
}))

describe('Stripe Webhook Handler', () => {
  let mockCacheInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    // Get the mock instance
    const lruCache = require('lru-cache')
    mockCacheInstance = lruCache.__getMockInstance()
    // Clear the cache mock functions
    mockCacheInstance.get.mockClear()
    mockCacheInstance.set.mockClear()
    // Default to not cached
    mockCacheInstance.get.mockReturnValue(false)
  })

  describe('POST /api/stripe/webhook', () => {
    it('should handle checkout.session.completed successfully', async () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            amount_total: 9900,
            currency: 'usd',
            customer_details: {
              email: 'test@example.com',
              name: 'Test User',
            },
            payment_method_types: ['card'],
            metadata: {
              businessId: 'business-123',
              utmToken: 'utm-token-123',
            },
          },
        },
      }

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
      ;(prisma.purchase.create as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
      })
      ;(prisma.utmToken.update as jest.Mock).mockResolvedValue({})
      ;(prisma.business.findUnique as jest.Mock).mockResolvedValue({
        id: 'business-123',
        name: 'Test Business',
        domain: 'example.com',
      })
      ;(prisma.purchase.count as jest.Mock).mockResolvedValue(1) // Not a first-time customer

      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: JSON.stringify(mockEvent),
        }
      )

      const response = await POST(request)

      // Debug output
      if (response.status !== 200) {
        const errorData = await response.json()
        console.log('Response status:', response.status)
        console.log('Response data:', errorData)
      }

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({ received: true })

      expect(prisma.purchase.create).toHaveBeenCalledWith({
        data: {
          stripeSessionId: 'cs_test_123',
          stripePaymentIntentId: 'pi_test_123',
          businessId: 'business-123',
          utmToken: 'utm-token-123',
          amount: 9900,
          currency: 'usd',
          customerEmail: 'test@example.com',
          status: 'completed',
          metadata: {
            customerName: 'Test User',
            paymentMethod: 'card',
          },
        },
      })

      expect(prisma.utmToken.update).toHaveBeenCalledWith({
        where: { token: 'utm-token-123' },
        data: {
          used: true,
          usedAt: expect.any(Date),
        },
      })

      expect(mockCacheInstance.set).toHaveBeenCalledWith(
        'evt_test_123-checkout.session.completed',
        true
      )
    })

    it('should skip already processed events (idempotency)', async () => {
      const mockEvent = {
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: { object: {} },
      }

      mockCacheInstance.get.mockReturnValue(true) // Event already processed
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: JSON.stringify(mockEvent),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })

    it('should return 400 for missing signature', async () => {
      jest.resetModules()
      jest.doMock('next/headers', () => ({
        headers: jest.fn(() =>
          Promise.resolve({
            get: jest.fn(() => null),
          })
        ),
      }))

      const { POST } = require('../route')
      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: '{}',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Missing stripe-signature header' })
    })

    it('should return 400 for invalid signature', async () => {
      ;(stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: '{}',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Invalid signature' })
    })

    it('should return 500 for processing errors', async () => {
      const mockEvent = {
        id: 'evt_test_500',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_500',
            payment_intent: 'pi_test_500',
            amount_total: 9900,
            currency: 'usd',
            customer_details: {
              email: 'test@example.com',
              name: 'Test User',
            },
            metadata: {
              businessId: 'business-123',
              utmToken: 'utm-token-123',
            },
          },
        },
      }

      // Ensure cache returns false for this event
      mockCacheInstance.get.mockReturnValue(false)
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
      ;(prisma.purchase.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: JSON.stringify(mockEvent),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Webhook processing failed' })
    })

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        id: 'evt_test_124',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: {
              message: 'Card declined',
            },
          },
        },
      }

      // Ensure cache returns false for this event
      mockCacheInstance.get.mockReturnValue(false)
      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
      ;(prisma.purchase.findFirst as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
        stripePaymentIntentId: 'pi_test_123',
        metadata: {},
      })
      ;(prisma.purchase.update as jest.Mock).mockResolvedValue({})

      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: JSON.stringify(mockEvent),
        }
      )

      const response = await POST(request)

      expect(response.status).toBe(200)

      // Wait for any async operations
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Verify the update was called
      expect(prisma.purchase.findFirst).toHaveBeenCalledWith({
        where: { stripePaymentIntentId: 'pi_test_123' },
      })
      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: {
          status: 'failed',
          metadata: expect.objectContaining({
            failureReason: 'Card declined',
          }),
        },
      })
    })

    it('should ignore unhandled event types', async () => {
      const mockEvent = {
        id: 'evt_test_125',
        type: 'unhandled.event.type',
        data: { object: {} },
      }

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)

      const request = new NextRequest(
        'http://localhost:3000/api/stripe/webhook',
        {
          method: 'POST',
          body: JSON.stringify(mockEvent),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ received: true })
      expect(prisma.purchase.create).not.toHaveBeenCalled()
    })
  })
})
