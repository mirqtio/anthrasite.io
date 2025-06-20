import { POST } from '../route'
import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { prisma } from '@/lib/db'
import { LRUCache } from 'lru-cache'

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
    },
    utmToken: {
      update: jest.fn(),
    },
  },
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

jest.mock('lru-cache', () => ({
  LRUCache: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}))

describe('Stripe Webhook Handler', () => {
  let mockCache: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
    }
    ;(LRUCache as jest.Mock).mockImplementation(() => mockCache)
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

      expect(mockCache.set).toHaveBeenCalledWith(
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

      mockCache.get.mockReturnValue(true) // Event already processed
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
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              businessId: 'business-123',
              utmToken: 'utm-token-123',
            },
          },
        },
      }

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

      ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent)
      ;(prisma.purchase.findFirst as jest.Mock).mockResolvedValue({
        id: 'purchase-123',
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
      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: {
          status: 'failed',
          metadata: {
            failureReason: 'Card declined',
          },
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
