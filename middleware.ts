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
]

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Run A/B testing middleware first to assign experiments
  let response = await abTestingMiddleware(request)

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
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https: blob:; " +
        "connect-src 'self' https://www.google-analytics.com https://api.stripe.com https://datadoghq-browser-agent.com https://*.sentry.io https://app.posthog.com; " +
        'frame-src https://js.stripe.com https://hooks.stripe.com;'
    )
  }

  // Check if this is a protected path that requires UTM validation
  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath) {
    // Check for UTM parameter
    const utm = searchParams.get('utm')

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
    const siteMode = request.cookies.get('site_mode')?.value

    if (utm) {
      // Validate UTM for homepage
      const validation = await validateUTMToken(utm)

      if (validation.valid) {
        // Set purchase mode
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

    // No UTM or invalid UTM - ensure organic mode
    if (siteMode === 'purchase' && !utm) {
      response = NextResponse.next(response)
      response.cookies.delete('site_mode')
      response.cookies.delete('business_id')
      return response
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
