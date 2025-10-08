/**
 * Helper to generate UTM tokens for E2E testing
 * Calls the admin API to create valid test tokens
 */

interface UTMTokenParams {
  businessId: string
  businessName: string
  domain: string
  expiryHours?: number
}

/**
 * Generate a valid UTM token for testing purchase flows
 */
export async function generateUTMToken(params: UTMTokenParams): Promise<string> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3333'
  const adminApiKey = process.env.ADMIN_API_KEY || 'test-admin-key-local-only'

  const response = await fetch(`${baseUrl}/api/admin/generate-utm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-api-key': adminApiKey,
    },
    body: JSON.stringify({
      businessId: params.businessId,
      businessName: params.businessName,
      domain: params.domain,
      expiryHours: params.expiryHours,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to generate UTM token: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  if (!data.token) {
    throw new Error('UTM token not found in response')
  }

  return data.token
}
