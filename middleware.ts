import { NextRequest, NextResponse } from 'next/server'
import { validateUTMToken } from '@/lib/utm/crypto'
import { abTestingMiddleware } from '@/lib/ab-testing/middleware'

// Per-worker cookie isolation for E2E tests
// Prevents parallel worker collisions on shared server/DB
const isE2E = process.env.E2E === '1'
const workerPrefix = isE2E ? (process.env.PW_WORKER_INDEX ?? 'w0') : ''
const cookieName = (base: string) => (isE2E ? `${base}_${workerPrefix}` : base)

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

  // 0) CRITICAL: Never touch framework/static paths or common assets
  // This must be the FIRST check before any cookie/header manipulation
  if (
    pathname.startsWith('/_next/') || // All Next.js internal paths (static, data, etc)
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next()
  }

  // Anonymous session management (must run before public path check for API routes)
  let response = NextResponse.next()
  let anonSid = request.cookies.get(cookieName('anon_sid'))?.value
  if (!anonSid) {
    anonSid = crypto.randomUUID()
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
    response.cookies.set(cookieName('anon_sid'), anonSid, cookieOptions)
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

    // Mock purchase mode - use mock services (Stripe, business data)
    // SECURITY: Only allow in non-production environments
    const mockAllowed =
      process.env.NODE_ENV !== 'production' &&
      process.env.USE_MOCK_PURCHASE === 'true'

    // UTM validation bypass - skip redirect logic for tests that need unrestricted access
    // This is INDEPENDENT of mockAllowed to allow testing redirects with mocks
    const bypassUTM =
      process.env.NODE_ENV !== 'production' &&
      process.env.BYPASS_UTM_VALIDATION === 'true'

    if (mockAllowed && bypassUTM) {
      // Old behavior: bypass redirects entirely for Stripe payment tests
      response = NextResponse.next(response)
      const cookieOptions = {
        httpOnly: false,
        sameSite: 'lax' as const,
        maxAge: 30 * 60, // 30 minutes
      }
      const businessId = `dev-business-${workerPrefix || '1'}`

      response.cookies.set(cookieName('site_mode'), 'purchase', cookieOptions)
      response.cookies.set(cookieName('business_id'), businessId, cookieOptions)
      return response
    }

    if (isTestMode && utm === bypassToken) {
      // Allow bypass with test business data
      response = NextResponse.next(response)
      const cookieOptions = {
        httpOnly: false,
        sameSite: 'lax' as const,
        maxAge: 30 * 60, // 30 minutes
      }
      const businessId = `test-business-${workerPrefix || '001'}`

      response.cookies.set(cookieName('site_mode'), 'purchase', cookieOptions)
      response.cookies.set(cookieName('business_id'), businessId, cookieOptions)
      return response
    }

    if (!utm) {
      // Check if user has existing purchase mode cookies (try worker-specific first, then fallback)
      const siteMode =
        request.cookies.get(cookieName('site_mode'))?.value ??
        request.cookies.get('site_mode')?.value
      const businessId =
        request.cookies.get(cookieName('business_id'))?.value ??
        request.cookies.get('business_id')?.value

      if (siteMode === 'purchase' && businessId) {
        // User has valid purchase mode cookies - allow access
        return NextResponse.next(response)
      }

      // No UTM and no purchase cookies - redirect to homepage with error
      response = NextResponse.redirect(new URL('/', request.url))
      const cookieOptions = {
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60, // 1 minute
      }
      response.cookies.set(cookieName('utm_error'), 'missing', cookieOptions)
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
      const errorCookieOptions = {
        httpOnly: true,
        sameSite: 'lax' as const,
        maxAge: 60, // 1 minute
      }
      response.cookies.set(
        cookieName('utm_error'),
        errorMessage,
        errorCookieOptions
      )
      return response
    }

    // Valid UTM - set mode cookie for homepage
    response = NextResponse.next(response)
    const purchaseCookieOptions = {
      httpOnly: false,
      sameSite: 'lax' as const,
      maxAge: 30 * 60, // 30 minutes
    }
    const businessId = validation.payload!.businessId

    response.cookies.set(
      cookieName('site_mode'),
      'purchase',
      purchaseCookieOptions
    )
    response.cookies.set(
      cookieName('business_id'),
      businessId,
      purchaseCookieOptions
    )

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
        const purchaseCookieOptions = {
          httpOnly: false,
          sameSite: 'lax' as const,
          maxAge: 30 * 60, // 30 minutes
        }
        const businessId = validation.payload!.businessId

        response.cookies.set(
          cookieName('site_mode'),
          'purchase',
          purchaseCookieOptions
        )
        response.cookies.set(
          cookieName('business_id'),
          businessId,
          purchaseCookieOptions
        )
        return response
      }
    }

    // No UTM on homepage - allow cookies to persist naturally (they'll expire after maxAge)
    // This enables purchase mode to persist across navigations within the session
  }

  return response
}

/**
 * CRITICAL: Middleware matcher - limits execution to page routes only
 *
 * Excludes:
 * - _next/static (JS chunks, CSS) - prevents ChunkLoadError and CSP violations
 * - _next/image (image optimization)
 * - _next/data (server-side data fetching)
 * - API routes (handle auth separately if needed)
 * - Public files (favicon, robots, sitemap)
 * - Static assets (assets/, images/)
 *
 * This prevents middleware from interfering with asset loading, which caused:
 * - 730+ "element not found" errors (app failed to hydrate)
 * - ChunkLoadError failures (JS bundles blocked)
 * - CSP violations (header conflicts on stylesheets)
 *
 * See: CI_logs/run-18467286196/DIAGNOSIS_AND_SOLUTIONS.md
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|assets/|images/|api/).*)',
  ],
}
