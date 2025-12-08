import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LEADSHOP_API_URL = process.env.LEADSHOP_API_URL || 'http://localhost:8000'

/**
 * Verify the request is from an authenticated admin user
 */
export async function verifyAdminSession(): Promise<{
  authenticated: boolean
  error?: string
}> {
  // Dev bypass
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_AUTH_BYPASS === 'true'
  ) {
    return { authenticated: true }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { authenticated: false, error: 'Unauthorized' }
    }

    return { authenticated: true }
  } catch {
    return { authenticated: false, error: 'Auth check failed' }
  }
}

/**
 * Proxy a request to LeadShop API
 */
export async function proxyToLeadShop(
  path: string,
  options: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  } = {}
): Promise<Response> {
  const { method = 'GET', body, headers = {} } = options

  const url = `${LEADSHOP_API_URL}${path}`

  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body)
  }

  try {
    const response = await fetch(url, fetchOptions)

    // Return the response as-is for streaming or direct passthrough
    return response
  } catch (error) {
    console.error(`Proxy error to ${url}:`, error)
    throw error
  }
}

/**
 * Higher-order handler that adds admin auth to a proxy route
 */
export function withAdminProxy(
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const auth = await verifyAdminSession()

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    return handler(request)
  }
}

/**
 * Create a simple proxy handler for GET requests
 */
export function createGetProxy(leadshopPath: string) {
  return withAdminProxy(async () => {
    const response = await proxyToLeadShop(leadshopPath)
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  })
}

/**
 * Create a simple proxy handler for POST requests
 */
export function createPostProxy(leadshopPath: string) {
  return withAdminProxy(async (request: NextRequest) => {
    const body = await request.json()
    const response = await proxyToLeadShop(leadshopPath, {
      method: 'POST',
      body,
    })
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  })
}
