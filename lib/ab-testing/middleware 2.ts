/**
 * A/B Testing Middleware
 * Handles experiment assignment and exposure tracking at the edge
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVariantAssignment, evaluateTargeting } from './variant-assignment'
import { fetchExperiments } from './edge-config'
import { Experiment } from './types'

// Cookie configuration
const USER_ID_COOKIE = 'ab_user_id'
const ASSIGNMENT_COOKIE_PREFIX = 'ab_exp_'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year

/**
 * Generate or retrieve user ID from cookies
 */
function getUserId(request: NextRequest): string {
  const existingId = request.cookies.get(USER_ID_COOKIE)?.value

  if (existingId) {
    return existingId
  }

  // Generate new ID
  return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get targeting context from request
 */
function getTargetingContext(request: NextRequest): Record<string, any> {
  const url = new URL(request.url)

  return {
    url: url.pathname,
    cookie: Object.fromEntries(
      Array.from(request.cookies.getAll()).map((c) => [c.name, c.value])
    ),
    header: Object.fromEntries(request.headers.entries()),
    // Add more context as needed
  }
}

/**
 * A/B Testing middleware function
 */
export async function abTestingMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const response = NextResponse.next()

  try {
    // Get or set user ID
    const userId = getUserId(request)
    if (!request.cookies.has(USER_ID_COOKIE)) {
      response.cookies.set(USER_ID_COOKIE, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
      })
    }

    // Fetch active experiments
    const experiments = await fetchExperiments()

    if (experiments.size === 0) {
      return response
    }

    // Get targeting context
    const targetingContext = getTargetingContext(request)

    // Process each experiment
    const assignments: Record<string, string> = {}

    for (const [experimentId, experiment] of experiments) {
      // Check if already assigned (from cookie)
      const cookieName = `${ASSIGNMENT_COOKIE_PREFIX}${experimentId}`
      const existingAssignment = request.cookies.get(cookieName)?.value

      if (existingAssignment) {
        assignments[experimentId] = existingAssignment
        continue
      }

      // Check targeting rules
      if (!evaluateTargeting(experiment, targetingContext)) {
        continue
      }

      // Assign variant
      const assignment = await getVariantAssignment(userId, experiment)

      if (assignment) {
        assignments[experimentId] = assignment.variantId

        // Set assignment cookie
        response.cookies.set(cookieName, assignment.variantId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: COOKIE_MAX_AGE,
        })
      }
    }

    // Add assignments to response headers for client-side access
    if (Object.keys(assignments).length > 0) {
      response.headers.set('X-AB-Assignments', JSON.stringify(assignments))
    }
  } catch (error) {
    console.error('A/B testing middleware error:', error)
    // Don't block the request on errors
  }

  return response
}

/**
 * Track exposure event (server-side)
 */
export async function trackExposure(
  experimentId: string,
  variantId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    // Send to analytics endpoint
    if (process.env.POSTHOG_API_KEY) {
      await fetch('https://app.posthog.com/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.POSTHOG_API_KEY,
          event: 'experiment_viewed',
          distinct_id: userId,
          properties: {
            experiment_id: experimentId,
            variant_id: variantId,
            ...metadata,
          },
          timestamp: new Date().toISOString(),
        }),
      })
    }
  } catch (error) {
    console.error('Failed to track exposure:', error)
  }
}

/**
 * Get experiment assignments from request headers
 * Useful for server components
 */
export function getAssignmentsFromHeaders(
  headers: Headers
): Record<string, string> {
  const assignmentsHeader = headers.get('X-AB-Assignments')

  if (!assignmentsHeader) {
    return {}
  }

  try {
    return JSON.parse(assignmentsHeader)
  } catch {
    return {}
  }
}
