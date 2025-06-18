import { POST } from '../route'
import { NextRequest } from 'next/server'
import { generateUTMToken } from '@/lib/utm/crypto'
import { getBusinessByDomain } from '@/lib/db/queries'

// Mock dependencies
jest.mock('@/lib/utm/crypto')
jest.mock('@/lib/db/queries')

describe('Generate UTM API (Dev)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock NODE_ENV
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    delete process.env.NODE_ENV
  })

  it('should generate UTM token successfully', async () => {
    const mockBusiness = {
      id: 'biz_123',
      name: 'Test Business',
      domain: 'testbusiness.com',
      email: 'test@example.com',
    }

    const mockUTMToken = {
      payload: 'mock_payload',
      signature: 'mock_signature',
    }
    const mockParameter = 'mock_payload.mock_signature'

    ;(getBusinessByDomain as jest.Mock).mockResolvedValue(mockBusiness)
    ;(generateUTMToken as jest.Mock).mockResolvedValue(mockUTMToken)

    // Also mock createUTMParameter
    const { createUTMParameter } = require('@/lib/utm/crypto')
    ;(createUTMParameter as jest.Mock).mockReturnValue(mockParameter)

    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          domain: 'testbusiness.com',
          price: 9900,
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      success: true,
      token: mockParameter,
      url: `http://localhost:3000/purchase?utm=${mockParameter}`,
      business: {
        ...mockBusiness,
        price: 9900,
        value: 49500,
      },
    })

    expect(getBusinessByDomain).toHaveBeenCalledWith('testbusiness.com')
    expect(generateUTMToken).toHaveBeenCalledWith('biz_123')
  })

  it('should handle missing domain', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          price: 9900,
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Domain is required' })
  })

  it('should handle business not found', async () => {
    ;(getBusinessByDomain as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          domain: 'unknown.com',
          price: 9900,
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data).toEqual({ error: 'Business not found' })
  })

  it('should use default price if not provided', async () => {
    const mockBusiness = {
      id: 'biz_123',
      name: 'Test Business',
      domain: 'testbusiness.com',
    }

    const mockUTMToken = {
      payload: 'mock_payload',
      signature: 'mock_signature',
    }

    ;(getBusinessByDomain as jest.Mock).mockResolvedValue(mockBusiness)
    ;(generateUTMToken as jest.Mock).mockResolvedValue(mockUTMToken)

    // Mock createUTMParameter
    const { createUTMParameter } = require('@/lib/utm/crypto')
    ;(createUTMParameter as jest.Mock).mockReturnValue('mock_parameter')

    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          domain: 'testbusiness.com',
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(generateUTMToken).toHaveBeenCalledWith('biz_123')
    expect(data.business.price).toBe(19900) // Default price
    expect(data.business.value).toBe(99500) // 5x default price
  })

  it('should calculate value as 5x price', async () => {
    const mockBusiness = {
      id: 'biz_123',
      name: 'Test Business',
      domain: 'testbusiness.com',
    }

    const mockUTMToken = {
      payload: 'mock_payload',
      signature: 'mock_signature',
    }

    ;(getBusinessByDomain as jest.Mock).mockResolvedValue(mockBusiness)
    ;(generateUTMToken as jest.Mock).mockResolvedValue(mockUTMToken)

    // Mock createUTMParameter
    const { createUTMParameter } = require('@/lib/utm/crypto')
    ;(createUTMParameter as jest.Mock).mockReturnValue('mock_parameter')

    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          domain: 'testbusiness.com',
          price: 10000,
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(generateUTMToken).toHaveBeenCalledWith('biz_123')
    expect(data.business.price).toBe(10000)
    expect(data.business.value).toBe(50000) // 5x price
  })

  it('should return 404 in production', async () => {
    process.env.NODE_ENV = 'production'

    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          domain: 'testbusiness.com',
        }),
      }
    )

    const response = await POST(request)

    expect(response.status).toBe(404)
  })

  it('should handle errors gracefully', async () => {
    ;(getBusinessByDomain as jest.Mock).mockRejectedValue(
      new Error('Database error')
    )

    const request = new NextRequest(
      'http://localhost:3000/api/dev/generate-utm',
      {
        method: 'POST',
        body: JSON.stringify({
          domain: 'testbusiness.com',
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to generate UTM token' })
  })
})
