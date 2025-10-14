// middleware/01-session.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware-chain'

export const withSession: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    const response = res ?? NextResponse.next()

    if (!req.cookies.get('anon_sid')?.value) {
      response.cookies.set('anon_sid', crypto.randomUUID(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
    }
    return next(req, evt, response)
  }
}
