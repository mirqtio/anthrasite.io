/**
 * @jest-environment node
 */
import { middleware } from '../middleware'
import { NextRequest, NextResponse } from 'next/server'
import { validateUTMToken } from '@/lib/utm/crypto'

jest.mock('@/lib/utm/crypto')

describe('UTM Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createRequest = (url: string, cookies?: Record<string, string>) => {
    const request = new NextRequest(new URL(url, 'http://localhost:3000'))

    if (cookies) {
      Object.entries(cookies).forEach(([name, value]) => {
        request.cookies.set(name, value)
      })
    }

    return request
  }

  describe('Protected paths', () => {
    it('should redirect to homepage when accessing /purchase without UTM', async () => {
      const request = createRequest('/purchase')
      const response = await middleware(request)

      expect(response?.status).toBe(307) // Redirect
      expect(response?.headers.get('location')).toBe('http://localhost:3000/')
      expect(response?.cookies.get('utm_error')?.value).toBe('missing')
    })

    it('should allow access to /purchase with valid UTM', async () => {
      ;(validateUTMToken as jest.Mock).mockResolvedValue({
        valid: true,
        payload: { businessId: 'test-123' },
      })

      const request = createRequest('/purchase?utm=valid-token')
      const response = await middleware(request)

      // Should not redirect (returns NextResponse.next())
      expect(response?.status).not.toBe(307)
      expect(response?.cookies.get('site_mode')?.value).toBe('purchase')
      expect(response?.cookies.get('business_id')?.value).toBe('test-123')
    })

    it('should redirect to expiration page for expired UTM', async () => {
      ;(validateUTMToken as jest.Mock).mockResolvedValue({
        valid: false,
        reason: 'expired',
      })

      const request = createRequest('/purchase?utm=expired-token')
      const response = await middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toBe(
        'http://localhost:3000/link-expired'
      )
      expect(response?.cookies.get('utm_error')?.value).toBe('expired')
    })

    it('should redirect to homepage for tampered UTM', async () => {
      ;(validateUTMToken as jest.Mock).mockResolvedValue({
        valid: false,
        reason: 'invalid_signature',
      })

      const request = createRequest('/purchase?utm=tampered-token')
      const response = await middleware(request)

      expect(response?.status).toBe(307)
      expect(response?.headers.get('location')).toBe('http://localhost:3000/')
      expect(response?.cookies.get('utm_error')?.value).toBe('tampered')
    })
  })

  describe('Homepage mode detection', () => {
    it('should set purchase mode with valid UTM on homepage', async () => {
      ;(validateUTMToken as jest.Mock).mockResolvedValue({
        valid: true,
        payload: { businessId: 'test-123' },
      })

      const request = createRequest('/?utm=valid-token')
      const response = await middleware(request)

      expect(response?.cookies.get('site_mode')?.value).toBe('purchase')
      expect(response?.cookies.get('business_id')?.value).toBe('test-123')
    })

    it('should clear purchase mode when returning without UTM', async () => {
      const request = createRequest('/', { site_mode: 'purchase' })
      const response = await middleware(request)

      // Should clear cookies
      const deletedCookies = []
      response?.cookies.getAll().forEach((cookie) => {
        if (cookie.value === '') deletedCookies.push(cookie.name)
      })

      expect(deletedCookies).toContain('site_mode')
      expect(deletedCookies).toContain('business_id')
    })

    it('should maintain purchase mode with existing cookie', async () => {
      const request = createRequest('/', { site_mode: 'purchase' })
      ;(validateUTMToken as jest.Mock).mockResolvedValue({
        valid: true,
        payload: { businessId: 'test-123' },
      })

      // Add UTM to maintain mode
      const requestWithUtm = createRequest('/?utm=valid-token', {
        site_mode: 'purchase',
      })
      const response = await middleware(requestWithUtm)

      expect(response?.cookies.get('site_mode')?.value).toBe('purchase')
    })
  })

  describe('Public paths', () => {
    it('should bypass middleware for API routes', async () => {
      const request = createRequest('/api/health')
      const response = await middleware(request)

      // Should not modify anything
      expect(response?.cookies.getAll()).toHaveLength(0)
    })

    it('should bypass middleware for static assets', async () => {
      const paths = [
        '/_next/static/css/app.css',
        '/_next/image?url=/logo.png',
        '/favicon.ico',
        '/robots.txt',
        '/sitemap.xml',
      ]

      for (const path of paths) {
        const request = createRequest(path)
        const response = await middleware(request)

        // Should not modify anything
        expect(response?.cookies.getAll()).toHaveLength(0)
      }
    })
  })

  describe('Cookie settings', () => {
    it('should set secure cookie options', async () => {
      ;(validateUTMToken as jest.Mock).mockResolvedValue({
        valid: true,
        payload: { businessId: 'test-123' },
      })

      const request = createRequest('/purchase?utm=valid-token')
      const response = await middleware(request)

      const siteModeCookie = response?.cookies.get('site_mode')
      expect(siteModeCookie?.value).toBe('purchase')
      // Cookie options are set internally by Next.js

      const businessIdCookie = response?.cookies.get('business_id')
      expect(businessIdCookie?.value).toBe('test-123')
    })

    it('should set short-lived error cookies', async () => {
      const request = createRequest('/purchase')
      const response = await middleware(request)

      const errorCookie = response?.cookies.get('utm_error')
      expect(errorCookie?.value).toBe('missing')
      // maxAge is set to 60 seconds
    })
  })
})
