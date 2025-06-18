import { POST } from '../route'
import { NextRequest } from 'next/server'
import { validateDomain } from '@/lib/waitlist/domain-validation'

// Mock dependencies
jest.mock('@/lib/waitlist/domain-validation')
jest.mock('@/lib/utm/rate-limit', () => ({
  withRateLimit: (handler: any) => handler
}))
jest.mock('@/lib/monitoring/api-middleware', () => ({
  withMonitoring: (handler: any) => handler
}))

describe('Validate Domain API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should validate a valid domain successfully', async () => {
    const domain = 'example.com'
    ;(validateDomain as jest.Mock).mockResolvedValue({
      isValid: true,
      normalizedDomain: 'example.com',
      hasActiveSite: true,
      technologies: ['WordPress', 'Cloudflare']
    })

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      valid: true,
      normalized: 'example.com',
      hasActiveSite: true,
      technologies: ['WordPress', 'Cloudflare']
    })
    expect(validateDomain).toHaveBeenCalledWith(domain)
  })

  it('should handle invalid domains', async () => {
    const domain = 'invalid-domain'
    ;(validateDomain as jest.Mock).mockResolvedValue({
      isValid: false,
      error: 'Invalid domain format',
      suggestion: 'invalid-domain.com'
    })

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      valid: false,
      error: 'Invalid domain format',
      suggestion: 'invalid-domain.com'
    })
  })

  it('should handle missing domain parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Domain is required'
    })
    expect(validateDomain).not.toHaveBeenCalled()
  })

  it('should handle empty domain string', async () => {
    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain: '' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Domain is required'
    })
  })

  it('should handle domain validation errors', async () => {
    const domain = 'example.com'
    ;(validateDomain as jest.Mock).mockRejectedValue(new Error('DNS lookup failed'))

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({
      error: 'Failed to validate domain'
    })
  })

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: 'invalid json',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({
      error: 'Invalid request'
    })
  })

  it('should normalize domain names', async () => {
    const domain = 'EXAMPLE.COM'
    ;(validateDomain as jest.Mock).mockResolvedValue({
      isValid: true,
      normalizedDomain: 'example.com',
      hasActiveSite: true
    })

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data.normalized).toBe('example.com')
  })

  it('should handle domains with protocols', async () => {
    const domain = 'https://example.com'
    ;(validateDomain as jest.Mock).mockResolvedValue({
      isValid: true,
      normalizedDomain: 'example.com',
      hasActiveSite: true
    })

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    await POST(request)

    expect(validateDomain).toHaveBeenCalledWith(domain)
  })

  it('should handle internationalized domain names', async () => {
    const domain = 'тест.com'
    ;(validateDomain as jest.Mock).mockResolvedValue({
      isValid: true,
      normalizedDomain: 'xn--e1aybc.com',
      hasActiveSite: true
    })

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.valid).toBe(true)
    expect(data.normalized).toBe('xn--e1aybc.com')
  })

  it('should include all validation details in response', async () => {
    const domain = 'example.com'
    const validationResult = {
      isValid: true,
      normalizedDomain: 'example.com',
      hasActiveSite: true,
      technologies: ['WordPress', 'WooCommerce'],
      sslEnabled: true,
      wwwRedirect: false,
      estimatedTraffic: 'Medium'
    }
    ;(validateDomain as jest.Mock).mockResolvedValue(validationResult)

    const request = new NextRequest('http://localhost:3000/api/waitlist/validate-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toMatchObject({
      valid: true,
      normalized: 'example.com',
      hasActiveSite: true,
      technologies: ['WordPress', 'WooCommerce'],
      sslEnabled: true,
      wwwRedirect: false,
      estimatedTraffic: 'Medium'
    })
  })
})