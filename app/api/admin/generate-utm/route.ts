import { NextRequest, NextResponse } from 'next/server'
import { generateUTMToken, createUTMParameter } from '@/lib/utm/crypto'
import { headers } from 'next/headers'

// Admin API to generate valid UTM tokens for testing
export async function POST(request: NextRequest) {
  try {
    // Security: Check for admin API key
    const headersList = headers()
    const apiKey = headersList.get('x-admin-api-key')

    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Also check if we're in a test environment or have test mode enabled
    const isTestEnvironment =
      process.env.NODE_ENV === 'development' ||
      process.env.ENABLE_TEST_MODE === 'true' ||
      process.env.VERCEL_ENV === 'preview'

    if (!isTestEnvironment && !process.env.ALLOW_ADMIN_UTM_GENERATION) {
      return NextResponse.json(
        { error: 'UTM generation not allowed in production' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { businessId, businessName, domain, expiryHours = 24 } = body

    if (!businessId || !businessName || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, businessName, domain' },
        { status: 400 }
      )
    }

    // Generate a valid UTM token
    const tokenData = await generateUTMToken(businessId)
    const token = createUTMParameter(tokenData)

    // Note: The current implementation doesn't store businessName and domain
    // in the token, only businessId. These would need to be stored in the database

    // Generate different URLs for testing
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const urls = {
      purchase: `${baseUrl}/purchase?utm=${token}`,
      purchaseWithPreview: `${baseUrl}/purchase?utm=${token}&preview=true`,
      homepage: `${baseUrl}/?utm=${token}`,
      // Direct link that should redirect to Stripe
      directCheckout: `${baseUrl}/purchase?utm=${token}&direct=true`,
    }

    return NextResponse.json({
      success: true,
      token,
      urls,
      expiresAt: new Date(
        Date.now() + expiryHours * 60 * 60 * 1000
      ).toISOString(),
      testData: {
        businessId,
        businessName,
        domain,
      },
    })
  } catch (error) {
    console.error('Failed to generate UTM token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if the service is available
export async function GET(request: NextRequest) {
  const isTestEnvironment =
    process.env.NODE_ENV === 'development' ||
    process.env.ENABLE_TEST_MODE === 'true' ||
    process.env.VERCEL_ENV === 'preview'

  return NextResponse.json({
    available: isTestEnvironment || !!process.env.ALLOW_ADMIN_UTM_GENERATION,
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}
