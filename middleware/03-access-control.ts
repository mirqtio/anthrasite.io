// middleware/03-access-control.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware-chain'
import { validateUTMToken } from '@/lib/utm/crypto'

const PROTECTED_PATHS = ['/purchase', '/checkout']
const LOOP_BREAKER = 'utm_handled_once'

// If your client-side code never reads these, keep true.
// Flip to false only if you *must* read them in JS.
const COOKIES_HTTP_ONLY = true

function setPurchaseCookies(
  response: NextResponse,
  businessId: string,
  maxAgeSec: number
) {
  response.cookies.set('site_mode', 'purchase', {
    path: '/',
    httpOnly: COOKIES_HTTP_ONLY,
    secure: true,
    sameSite: 'lax',
    maxAge: maxAgeSec,
  })
  response.cookies.set('business_id', businessId, {
    path: '/',
    httpOnly: COOKIES_HTTP_ONLY,
    secure: true,
    sameSite: 'lax',
    maxAge: maxAgeSec,
  })
}

export const withAccessControl: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    const response = res ?? NextResponse.next()
    const { pathname, searchParams } = req.nextUrl

    // Loop-breaker: if we've already handled a bad UTM, skip UTM logic
    if (req.cookies.get(LOOP_BREAKER)?.value === '1') {
      return next(req, evt, response)
    }

    const allowE2EHeaders = process.env.NODE_ENV !== 'production'
    const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
    const onHomepage = pathname === '/'

    // --- 1) Explicit E2E (honored only when NODE_ENV !== 'production')
    const e2eMode = req.headers.get('x-e2e-mode')
    if (e2eMode && allowE2EHeaders) {
      const businessId =
        req.headers.get('x-e2e-business-id') || 'test-business-e2e'
      setPurchaseCookies(response, businessId, 60)
      return next(req, evt, response)
    }

    // --- 2) Local dev bypass (manual testing without valid token)
    const utm = searchParams.get('utm')
    if (process.env.NODE_ENV === 'development' && utm === 'dev') {
      setPurchaseCookies(response, 'dev-bypass', 30 * 60)
      return next(req, evt, response)
    }

    // --- 3) Homepage UTM handling (keep behavior parity without broadening PROTECTED_PATHS)
    if (onHomepage && utm) {
      const validation = await validateUTMToken(utm)
      if (validation?.valid && validation.payload?.businessId) {
        setPurchaseCookies(response, validation.payload.businessId, 30 * 60)
        return next(req, evt, response)
      } else {
        // Invalid UTM on homepage: redirect based on reason
        response.cookies.set(LOOP_BREAKER, '1', {
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 15,
        })
        const url = req.nextUrl.clone()
        url.searchParams.delete('utm') // Prevent redirect loop

        // Expired tokens go to special page
        if (validation?.reason === 'expired') {
          url.pathname = '/link-expired'
        } else {
          url.pathname = '/'
        }

        return NextResponse.redirect(url, { headers: response.headers })
      }
    }

    // --- 4) Protected routes: require UTM/SID or valid prior cookies
    if (!isProtected) return next(req, evt, response)

    const siteMode = req.cookies.get('site_mode')?.value

    // New JWT pattern uses 'sid' param - let those through for page-level validation
    const sid = searchParams.get('sid')
    if (sid) {
      // JWT validation happens in the page component, just let it through
      return next(req, evt, response)
    }

    // Stripe checkout success uses 'session_id' param - let those through
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      // Session validation happens in the page component
      return next(req, evt, response)
    }

    if (!utm) {
      if (siteMode === 'purchase') return next(req, evt, response)
      response.cookies.set(LOOP_BREAKER, '1', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 15,
      })
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.delete('utm') // Prevent redirect loop
      return NextResponse.redirect(url, { headers: response.headers })
    }

    const validation = await validateUTMToken(utm)
    if (!validation?.valid || !validation.payload?.businessId) {
      response.cookies.set(LOOP_BREAKER, '1', {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 15,
      })
      const url = req.nextUrl.clone()
      url.searchParams.delete('utm') // Prevent redirect loop

      // Expired tokens go to special page
      if (validation?.reason === 'expired') {
        url.pathname = '/link-expired'
      } else {
        url.pathname = '/'
      }

      return NextResponse.redirect(url, { headers: response.headers })
    }

    setPurchaseCookies(response, validation.payload.businessId, 30 * 60)
    return next(req, evt, response)
  }
}
