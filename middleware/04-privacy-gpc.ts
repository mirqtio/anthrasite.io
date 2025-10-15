// middleware/04-privacy-gpc.ts
import type { MiddlewareFactory } from '@/lib/middleware-chain'

/**
 * Middleware to detect the Global Privacy Control (GPC) signal.
 * If the `Sec-GPC` header is present and set to '1', it sets a `do_not_share` cookie.
 */
export const withPrivacyGPC: MiddlewareFactory = (next) => {
  return async (req, evt, res) => {
    // First, let the rest of the middleware chain run.
    const response = res ?? (await next(req, evt, res))

    // After getting the response, check for the GPC header on the original request.
    if (req.headers.get('Sec-GPC') === '1') {
      // If the cookie isn't already set, set it.
      if (req.cookies.get('do_not_share')?.value !== '1') {
        response.cookies.set('do_not_share', '1', {
          path: '/',
          maxAge: 31536000,
        }) // 1 year
      }
    }

    return response
  }
}
