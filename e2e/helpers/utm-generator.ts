/**
 * Helper to generate UTM tokens for E2E testing
 * Calls the admin API to create valid test tokens
 */

interface UTMTokenParams {
  businessId: string
  businessName: string
  price: number
}

/**
 * Generate a valid UTM token for testing purchase flows
 */
export async function generateUTMToken(params: UTMTokenParams): Promise<string> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3333'

  const response = await fetch(`${baseUrl}/api/admin/generate-utm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      businessId: params.businessId,
      businessName: params.businessName,
      price: params.price,
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
