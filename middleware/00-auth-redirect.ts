import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware-chain'

export const withAuthRedirect: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    const response = res ?? NextResponse.next()
    const { pathname, searchParams } = req.nextUrl

    // If landing on root with an auth code, redirect to callback
    // This handles cases where Supabase defaults to Site URL (/) for invites
    if (pathname === '/' && searchParams.has('code')) {
      const code = searchParams.get('code')
      const url = req.nextUrl.clone()
      url.pathname = '/auth/callback'
      url.searchParams.set('code', code!)
      // Default to update-password for these "lost" invites
      if (!url.searchParams.has('next')) {
        url.searchParams.set('next', '/update-password')
      }
      return NextResponse.redirect(url)
    }

    return next(req, evt, response)
  }
}
