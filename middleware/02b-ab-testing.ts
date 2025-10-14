// middleware/02b-ab-testing.ts
import { NextResponse } from 'next/server'
import type { MiddlewareFactory } from '@/lib/middleware-chain'

// Minimal stub; port your existing abTestingMiddleware logic here.
export const withABTesting: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    const response = res ?? NextResponse.next()
    // Example: set a sticky experiment bucket if missing
    if (!req.cookies.get('ab_bucket')?.value) {
      response.cookies.set('ab_bucket', Math.random() < 0.5 ? 'A' : 'B', {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      })
    }
    return next(req, evt, response)
  }
}
