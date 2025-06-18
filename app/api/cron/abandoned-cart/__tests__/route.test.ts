/**
 * @jest-environment node
 */
import { AbandonedCartService } from '@/lib/abandoned-cart/service'
import { prisma } from '@/lib/db'

// Mock Next.js
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => ({
    headers: new Map(Object.entries(init?.headers || {})),
    url,
  })),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
    })),
  },
}))

// Mock dependencies
jest.mock('@/lib/abandoned-cart/service')
jest.mock('@/lib/db', () => ({
  prisma: {
    analyticsEvent: {
      create: jest.fn(),
    },
  },
}))

describe('Abandoned Cart Cron Route', () => {
  let mockRequest: any
  let GET: any
  let POST: any

  beforeAll(async () => {
    // Set environment variables before importing the route
    process.env.CRON_SECRET = 'test-cron-secret'
    process.env.NEXT_PUBLIC_BASE_URL = 'https://test.anthrasite.io'

    // Dynamically import the route after setting env vars
    const route = await import('../route')
    GET = route.GET
    POST = route.POST
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = {
      headers: {
        get: jest.fn((key: string) => {
          if (key === 'authorization') {
            return mockRequest._authHeader
          }
          return null
        }),
      },
      _authHeader: null,
    }
  })

  describe('Authorization', () => {
    it('should reject requests without authorization header', async () => {
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should reject requests with invalid authorization', async () => {
      mockRequest._authHeader = 'Bearer invalid-secret'

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should accept requests with valid authorization', async () => {
      mockRequest._authHeader = 'Bearer test-cron-secret'

      const mockCheckAbandoned = jest.fn().mockResolvedValue({
        processed: 5,
        results: [
          { cartId: '1', success: true },
          { cartId: '2', success: true },
          { cartId: '3', success: false, reason: 'no_email' },
        ],
      })

      ;(AbandonedCartService as jest.Mock).mockImplementation(() => ({
        checkAbandoned: mockCheckAbandoned,
      }))

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.processed).toBe(5)
    })
  })

  describe('Processing', () => {
    beforeEach(() => {
      mockRequest._authHeader = 'Bearer test-cron-secret'
    })

    it('should process abandoned carts successfully', async () => {
      const mockResults = {
        processed: 10,
        results: [
          { cartId: '1', success: true },
          { cartId: '2', success: true },
          { cartId: '3', success: false, reason: 'no_email' },
          { cartId: '4', success: true },
          { cartId: '5', success: false, error: 'Email service error' },
        ],
      }

      const mockCheckAbandoned = jest.fn().mockResolvedValue(mockResults)

      ;(AbandonedCartService as jest.Mock).mockImplementation(() => ({
        checkAbandoned: mockCheckAbandoned,
      }))
      ;(prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({})

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        processed: 10,
        results: mockResults.results,
      })

      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          eventName: 'abandoned_cart_cron_executed',
          properties: {
            processed: 10,
            successful: 3,
            failed: 2,
          },
        },
      })
    })

    it('should handle service errors gracefully', async () => {
      const mockCheckAbandoned = jest
        .fn()
        .mockRejectedValue(new Error('Service error'))

      ;(AbandonedCartService as jest.Mock).mockImplementation(() => ({
        checkAbandoned: mockCheckAbandoned,
      }))
      ;(prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({})

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')

      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: {
          eventName: 'abandoned_cart_cron_error',
          properties: {
            error: 'Service error',
          },
        },
      })
    })

    it('should handle analytics tracking errors gracefully', async () => {
      const mockCheckAbandoned = jest.fn().mockResolvedValue({
        processed: 1,
        results: [{ cartId: '1', success: true }],
      })

      ;(AbandonedCartService as jest.Mock).mockImplementation(() => ({
        checkAbandoned: mockCheckAbandoned,
      }))
      ;(prisma.analyticsEvent.create as jest.Mock).mockRejectedValue(
        new Error('DB error')
      )

      const response = await GET(mockRequest)
      const data = await response.json()

      // When analytics fails, the whole request fails
      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })
  })

  describe('POST endpoint', () => {
    it('should support POST method', async () => {
      mockRequest._authHeader = 'Bearer test-cron-secret'

      const mockCheckAbandoned = jest.fn().mockResolvedValue({
        processed: 1,
        results: [{ cartId: '1', success: true }],
      })

      ;(AbandonedCartService as jest.Mock).mockImplementation(() => ({
        checkAbandoned: mockCheckAbandoned,
      }))
      ;(prisma.analyticsEvent.create as jest.Mock).mockResolvedValue({})

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockCheckAbandoned).toHaveBeenCalled()
    })
  })
})
