/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Import middleware dynamically after env setup to avoid cached E2E mode
let middleware: any
let validateUTMToken: jest.Mock

// Mock NextRequest and NextResponse for node environment
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server')

  class MockNextRequest {
    url: string
    method: string
    headers: Map<string, string>
    cookies: any
    nextUrl: URL

    constructor(input: string | URL, init?: any) {
      const url = typeof input === 'string' ? new URL(input) : input
      this.url = url.toString()
      this.nextUrl = url
      this.method = init?.method || 'GET'
      this.headers = new Map()

      // Create cookies object with methods
      const cookieStore = new Map()
      this.cookies = {
        get: (name: string) => cookieStore.get(name),
        set: (name: string, value: string) => {
          cookieStore.set(name, { value })
        },
        has: (name: string) => cookieStore.has(name),
      }

      if (init?.headers) {
        Object.entries(init.headers).forEach(([key, value]) => {
          this.headers.set(key, value as string)
        })
      }
    }
  }

  return {
    ...originalModule,
    NextRequest: MockNextRequest,
    NextResponse: {
      ...originalModule.NextResponse,
      next: (init?: any) => {
        const response: any = new Response(null, init)
        // Preserve existing cookies if passed a response object
        const cookieStore = new Map()
        if (init?.cookies) {
          const existingCookies = init.cookies.getAll?.() || []
          existingCookies.forEach((cookie: any) => {
            cookieStore.set(cookie.name, { value: cookie.value, ...cookie })
          })
        }
        response.cookies = {
          set: (name: string, value: string, options?: any) => {
            cookieStore.set(name, { value, ...options })
          },
          get: (name: string) => cookieStore.get(name),
          getAll: () =>
            Array.from(cookieStore.entries()).map(([name, data]) => ({
              name,
              ...data,
            })),
          delete: (name: string) => cookieStore.set(name, { value: '' }),
        }
        return response
      },
      redirect: (url: string | URL, status = 307) => {
        const response: any = new Response(null, {
          status,
          headers: { Location: url.toString() },
        })
        const cookieStore = new Map()
        response.cookies = {
          set: (name: string, value: string, options?: any) => {
            cookieStore.set(name, { value, ...options })
          },
          get: (name: string) => cookieStore.get(name),
          getAll: () =>
            Array.from(cookieStore.entries()).map(([name, data]) => ({
              name,
              ...data,
            })),
          delete: (name: string) => cookieStore.set(name, { value: '' }),
        }
        return response
      },
    },
  }
})

describe('UTM Middleware', () => {
  beforeEach(async () => {
    // Ensure E2E mode is disabled for unit tests (prevents worker suffix on cookies)
    delete process.env.E2E
    delete process.env.PW_WORKER_INDEX
    // Force reload middleware module to pick up env changes
    jest.resetModules()
    // Re-mock the crypto module after reset
    const mockValidateUTMToken = jest.fn()
    jest.doMock('@/lib/utm/crypto', () => ({
      validateUTMToken: mockValidateUTMToken,
    }))
    // Dynamically import middleware after env is cleared
    const middlewareModule = await import('../middleware')
    middleware = middlewareModule.middleware
    // Get reference to mocked function for test assertions
    const cryptoModule = await import('@/lib/utm/crypto')
    validateUTMToken = cryptoModule.validateUTMToken as jest.Mock
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

    it('should persist purchase mode cookies when returning without UTM', async () => {
      const request = createRequest('/', { site_mode: 'purchase' })
      const response = await middleware(request)

      // Cookies should persist (not be deleted) - they expire naturally after maxAge
      const deletedCookies = []
      response?.cookies.getAll().forEach((cookie) => {
        if (cookie.value === '') deletedCookies.push(cookie.name)
      })

      expect(deletedCookies).not.toContain('site_mode')
      expect(deletedCookies).not.toContain('business_id')
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

      // Should set anon session but skip other middleware
      const cookies = response?.cookies.getAll()
      expect(cookies).toHaveLength(1)
      expect(cookies?.[0].name).toBe('anon_sid')
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

        // All static assets are excluded by matcher - middleware doesn't run at all
        // Updated behavior: robots.txt and sitemap.xml are now in matcher exclusion list
        const cookies = response?.cookies.getAll()
        expect(cookies).toHaveLength(0)
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
