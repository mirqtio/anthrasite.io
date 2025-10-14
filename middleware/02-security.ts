// middleware/02-security.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware-chain'

export const withSecurity: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    const response = res ?? NextResponse.next()

    // Minimal example; add your CSP/HSTS/etc. here.
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return next(req, evt, response)
  }
}
