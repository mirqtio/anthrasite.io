/**
 * Payment Intent API Route Tests
 * Tests feature flag enforcement and tier validation
 */

import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock the feature flags module
jest.mock('@/lib/feature-flags', () => ({
  isPaymentElementEnabled: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    purchase: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
      }),
    },
  }))
})

// Mock headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn((key: string) => {
      if (key === 'x-anon-session') return 'test-session-id'
      return null
    }),
  })),
}))

import { isPaymentElementEnabled } from '@/lib/feature-flags'
import { prisma } from '@/lib/db'

describe('/api/checkout/payment-intent', () => {
  const mockIsPaymentElementEnabled =
    isPaymentElementEnabled as jest.MockedFunction<
      typeof isPaymentElementEnabled
    >
  const mockPrismaCreate = prisma.purchase.create as jest.MockedFunction<
    typeof prisma.purchase.create
  >
  const mockPrismaUpdate = prisma.purchase.update as jest.MockedFunction<
    typeof prisma.purchase.update
  >
  const mockPrismaFindFirst = prisma.purchase.findFirst as jest.MockedFunction<
    typeof prisma.purchase.findFirst
  >

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default Prisma mock responses
    mockPrismaFindFirst.mockResolvedValue(null) // No existing purchase
    mockPrismaCreate.mockResolvedValue({
      id: 'purchase_test_123',
      businessId: 'business_test_123',
      amount: 39900,
      currency: 'usd',
      status: 'pending',
      stripePaymentIntentId: null,
      utmToken: null,
      metadata: null,
      customerEmail: null,
      stripeSessionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockPrismaUpdate.mockResolvedValue({
      id: 'purchase_test_123',
      businessId: 'business_test_123',
      amount: 39900,
      currency: 'usd',
      status: 'pending',
      stripePaymentIntentId: 'pi_test_123',
      utmToken: null,
      metadata: null,
      customerEmail: null,
      stripeSessionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  describe('Feature Flag Enforcement', () => {
    it('returns 403 when feature flag is OFF', async () => {
      mockIsPaymentElementEnabled.mockReturnValue(false)

      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({ tier: 'basic' }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Feature disabled')
    })

    it('processes request when feature flag is ON', async () => {
      mockIsPaymentElementEnabled.mockReturnValue(true)
      process.env.NODE_ENV = 'development' // Allow tier from body in dev

      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)

      expect(response.status).toBe(200)
    })
  })

  describe('Business ID Validation', () => {
    beforeEach(() => {
      mockIsPaymentElementEnabled.mockReturnValue(true)
      process.env.NODE_ENV = 'development'
    })

    it('returns 400 when businessId is missing', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({ tier: 'basic' }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing businessId')
    })

    it('accepts request with valid businessId', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)

      expect(response.status).toBe(200)
    })
  })

  describe('Purchase Record Creation', () => {
    beforeEach(() => {
      mockIsPaymentElementEnabled.mockReturnValue(true)
      process.env.NODE_ENV = 'development'
    })

    it('creates a Purchase record with pending status', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      await POST(req)

      expect(mockPrismaCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          businessId: 'business_test_123',
          amount: 39900,
          currency: 'usd',
          status: 'pending',
        }),
      })
    })

    it('updates Purchase record with Stripe payment intent ID', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      await POST(req)

      expect(mockPrismaUpdate).toHaveBeenCalledWith({
        where: { id: 'purchase_test_123' },
        data: {
          stripePaymentIntentId: 'pi_test_123',
        },
      })
    })

    it('returns purchaseId in response', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.publicMeta.purchaseId).toBe('purchase_test_123')
    })

    it('reuses existing pending purchase for same session', async () => {
      mockPrismaFindFirst.mockResolvedValue({
        id: 'existing_purchase_123',
        businessId: 'business_test_123',
        status: 'pending',
      })

      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      await POST(req)

      expect(mockPrismaFindFirst).toHaveBeenCalled()
      expect(mockPrismaCreate).not.toHaveBeenCalled()
      expect(mockPrismaUpdate).toHaveBeenCalledWith({
        where: { id: 'existing_purchase_123' },
        data: expect.any(Object),
      })
    })
  })

  describe('Tier Validation', () => {
    beforeEach(() => {
      mockIsPaymentElementEnabled.mockReturnValue(true)
      process.env.NODE_ENV = 'development'
    })

    it('returns 400 for invalid tier', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({ tier: 'invalid' }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid tier')
    })

    it('returns 400 for missing tier', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid tier')
    })

    it('accepts valid basic tier', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.clientSecret).toBeTruthy()
      expect(data.publicMeta.tier).toBe('basic')
      expect(data.publicMeta.amount).toBe(39900)
    })

    it('accepts valid pro tier', async () => {
      mockPrismaCreate.mockResolvedValue({
        id: 'purchase_test_123',
        businessId: 'business_test_123',
        amount: 69900,
        currency: 'usd',
        status: 'pending',
        stripePaymentIntentId: null,
      })

      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'pro',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.clientSecret).toBeTruthy()
      expect(data.publicMeta.tier).toBe('pro')
      expect(data.publicMeta.amount).toBe(69900)
    })

    it('tier validation is case-insensitive', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'BASIC',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.publicMeta.tier).toBe('basic')
    })
  })

  describe('Production Environment', () => {
    beforeEach(() => {
      mockIsPaymentElementEnabled.mockReturnValue(true)
      process.env.NODE_ENV = 'production'
    })

    afterEach(() => {
      process.env.NODE_ENV = 'test'
    })

    it('rejects tier from body in production', async () => {
      const req = new NextRequest(
        'http://localhost/api/checkout/payment-intent',
        {
          method: 'POST',
          body: JSON.stringify({
            tier: 'basic',
            businessId: 'business_test_123',
          }),
        }
      )

      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid tier')
    })
  })
})
