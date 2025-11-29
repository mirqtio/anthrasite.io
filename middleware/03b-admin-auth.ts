import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware-chain'

export const withAdminAuth: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    const response = res ?? NextResponse.next()
    const { pathname } = req.nextUrl

    // Only protect /admin routes
    if (!pathname.startsWith('/admin')) {
      return next(req, evt, response)
    }

    // Dev Bypass
    if (process.env.NODE_ENV === 'development') {
      if (
        req.nextUrl.searchParams.get('bypass') === 'true' ||
        process.env.ADMIN_AUTH_BYPASS === 'true'
      ) {
        return next(req, evt, response)
      }
    }

    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Redirect to login or return 403
      // For now, returning 403 JSON if API, or simple text if page
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      // Redirect to login page
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Optional: Check for specific role in app_metadata or user_metadata
    // const role = user.app_metadata?.role || user.user_metadata?.role
    // if (!['ops_admin', 'support'].includes(role)) {
    //   return new NextResponse('Forbidden: Insufficient Permissions', { status: 403 })
    // }

    return next(req, evt, response)
  }
}
