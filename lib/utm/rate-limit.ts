import { LRUCache } from 'lru-cache'

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10 // 10 requests per minute per IP

// In-memory rate limiter using LRU cache
// In production, use Redis for distributed rate limiting
const rateLimitCache = new LRUCache<string, number[]>({
  max: 10000, // Store up to 10k unique IPs
  ttl: RATE_LIMIT_WINDOW,
})

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if an IP is rate limited
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Get existing requests for this IP
  const requests = rateLimitCache.get(ip) || []

  // Filter out requests outside the current window
  const recentRequests = requests.filter((timestamp) => timestamp > windowStart)

  // Check if limit exceeded
  const allowed = recentRequests.length < RATE_LIMIT_MAX_REQUESTS

  if (allowed) {
    // Add current request
    recentRequests.push(now)
    rateLimitCache.set(ip, recentRequests)
  }

  return {
    allowed,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - recentRequests.length),
    resetAt:
      recentRequests.length > 0
        ? recentRequests[0] + RATE_LIMIT_WINDOW
        : now + RATE_LIMIT_WINDOW,
  }
}

/**
 * Rate limit middleware for API routes
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>
): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    // Skip rate limiting in development mode or when explicitly disabled for tests
    const skipRateLimit =
      process.env.NODE_ENV === 'development' ||
      process.env.DISABLE_RATE_LIMIT === 'true'

    if (skipRateLimit) {
      return handler(req)
    }

    // Extract IP from request
    const ip = getClientIp(req)

    // Check rate limit
    const { allowed, remaining, resetAt } = checkRateLimit(ip)

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toString(),
            'Retry-After': Math.ceil((resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Execute handler
    const response = await handler(req)

    // Add rate limit headers
    response.headers.set(
      'X-RateLimit-Limit',
      RATE_LIMIT_MAX_REQUESTS.toString()
    )
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', resetAt.toString())

    return response
  }
}

/**
 * Extract client IP from request
 */
function getClientIp(req: Request): string {
  // Check various headers that might contain the real IP
  const headers = req.headers

  // Vercel forwards the real IP
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a default
  return '127.0.0.1'
}

/**
 * Reset rate limit for an IP (useful for testing)
 */
export function resetRateLimit(ip: string): void {
  rateLimitCache.delete(ip)
}

/**
 * Get current rate limit status for an IP
 */
export function getRateLimitStatus(ip: string): RateLimitResult {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  const requests = rateLimitCache.get(ip) || []
  const recentRequests = requests.filter((timestamp) => timestamp > windowStart)

  return {
    allowed: recentRequests.length < RATE_LIMIT_MAX_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_MAX_REQUESTS - recentRequests.length),
    resetAt:
      recentRequests.length > 0
        ? recentRequests[0] + RATE_LIMIT_WINDOW
        : now + RATE_LIMIT_WINDOW,
  }
}
