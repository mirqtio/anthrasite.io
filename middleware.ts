import { NextRequest, NextResponse } from 'next/server'
import { validateUTMToken } from '@/lib/utm/crypto'
import { abTestingMiddleware } from '@/lib/ab-testing/middleware'

// Paths that require valid UTM parameters
const PROTECTED_PATHS = ['/purchase', '/checkout']

// Paths that should bypass middleware
const PUBLIC_PATHS = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/dev', // Development routes bypass middleware
  '/purchase-preview', // Preview route for internal testing
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Early exclusion for paths that should never run middleware (matches config.matcher)
  const excludedPaths = ['/_next/static', '/_next/image', '/favicon.ico']
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Anonymous session management (must run before public path check for API routes)
  let response = NextResponse.next()
  let anonSid = request.cookies.get('anon_sid')?.value
  if (!anonSid) {
    anonSid = crypto.randomUUID()
    response.cookies.set('anon_sid', anonSid, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }
  // Make session ID available to API routes via header
  response.headers.set('x-anon-session', anonSid)

  // Skip remaining middleware for non-API public paths
  const isApiRoute = pathname.startsWith('/api')
  const isOtherPublicPath = PUBLIC_PATHS.filter((p) => p !== '/api').some(
    (path) => pathname.startsWith(path)
  )

  if (isOtherPublicPath) {
    return response
  }

  // For API routes, anon session is set but skip other middleware
  if (isApiRoute) {
    return response
  }

  // Run A/B testing middleware for page routes
  response = await abTestingMiddleware(request)

  // Re-apply anon session header after A/B middleware
  if (anonSid) {
    response.headers.set('x-anon-session', anonSid)
  }

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  // Add CSP header for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://static.hotjar.com https://script.hotjar.com https://app.posthog.com https://cdn.posthog.com https://us-assets.i.posthog.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://datadoghq-browser-agent.com https://*.datadoghq.com https://browser-intake-us5-datadoghq.com https://*.sentry.io https://app.posthog.com https://us.i.posthog.com https://us-assets.i.posthog.com https://*.hotjar.com https://*.hotjar.io wss://*.hotjar.com; " +
        'frame-src https://js.stripe.com https://hooks.stripe.com https://vars.hotjar.com; ' +
        "child-src 'self' blob:;"
    )
  }

  // Check if this is a protected path that requires UTM validation
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath) {
    // Check for UTM parameter
    const utm = searchParams.get('utm')

    // Development/Test bypass
    const bypassToken = process.env.UTM_BYPASS_TOKEN || 'dev-test-token'
    const isTestMode =
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_TEST_MODE === 'true' ||
      process.env.VERCEL_ENV === 'preview' ||
      utm === 'dev-test-token' // Hard-coded fallback for development

    // Mock purchase mode - bypass UTM validation entirely
    // SECURITY: Only allow in non-production environments
    const mockAllowed =
      process.env.NODE_ENV !== 'production' &&
      process.env.USE_MOCK_PURCHASE === 'true'

    if (mockAllowed) {
      // Allow bypass with test business data in mock mode
      response = NextResponse.next(response)
      response.cookies.set('site_mode', 'purchase', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutes
      })
      response.cookies.set('business_id', 'dev-business-1', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutes
      })
      return response
    }

    if (isTestMode && utm === bypassToken) {
      // Allow bypass with test business data
      response = NextResponse.next(response)
      response.cookies.set('site_mode', 'purchase', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutes
      })
      response.cookies.set('business_id', 'test-business-001', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 30 * 60, // 30 minutes
      })
      return response
    }

    if (!utm) {
      // Redirect to homepage with error
      response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.set('utm_error', 'missing', {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60, // 1 minute
      })
      return response
    }

    // Quick validation (full validation happens in API)
    const validation = await validateUTMToken(utm)

    if (!validation.valid) {
      // Handle different error types
      let errorPage = '/'
      let errorMessage = 'invalid'

      if (validation.reason === 'expired') {
        errorPage = '/link-expired'
        errorMessage = 'expired'
      } else if (validation.reason === 'invalid_signature') {
        errorPage = '/'
        errorMessage = 'tampered'
      }

      response = NextResponse.redirect(new URL(errorPage, request.url))
      response.cookies.set('utm_error', errorMessage, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60, // 1 minute
      })
      return response
    }

    // Valid UTM - set mode cookie for homepage
    response = NextResponse.next(response)
    response.cookies.set('site_mode', 'purchase', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    })

    // Store business ID in cookie for later use
    response.cookies.set('business_id', validation.payload!.businessId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 60, // 30 minutes
    })

    return response
  }

  // Homepage mode detection
  if (pathname === '/') {
    const utm = searchParams.get('utm')

    if (utm) {
      // Validate UTM for homepage
      const validation = await validateUTMToken(utm)

      if (validation.valid) {
        // Set purchase mode - cookies persist for 30 minutes (SameSite=Lax)
        response = NextResponse.next(response)
        response.cookies.set('site_mode', 'purchase', {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 30 * 60, // 30 minutes
        })
        response.cookies.set('business_id', validation.payload!.businessId, {
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 30 * 60, // 30 minutes
        })
        return response
      }
    }

    // No UTM on homepage - allow cookies to persist naturally (they'll expire after maxAge)
    // This enables purchase mode to persist across navigations within the session
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Note: API routes are now INCLUDED for anon session management
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
