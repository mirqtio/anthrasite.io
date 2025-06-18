import { NextRequest, NextResponse } from 'next/server'
import { generateUTMToken, createUTMParameter } from '@/lib/utm/crypto'
import { getBusinessByDomain } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    )
  }

  // Generate a new mock UTM token
  const mockToken = `dev-utm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Available business IDs from mock data
  const businessIds = ['dev-business-1', 'dev-business-2', 'dev-business-3']
  const randomBusinessId =
    businessIds[Math.floor(Math.random() * businessIds.length)]

  return NextResponse.json({
    token: mockToken,
    businessId: randomBusinessId,
    purchaseUrl: `/purchase?utm=${mockToken}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    note: 'This is a development-only mock UTM token. It will only work with NEXT_PUBLIC_USE_MOCK_PURCHASE=true',
  })
}

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 404 }
    )
  }

  try {
    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { domain, price = 19900 } = body

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Lookup business by domain
    const business = await getBusinessByDomain(domain)

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Calculate value as 5x price
    const value = price * 5

    // Generate UTM token with business ID
    const utmToken = await generateUTMToken(business.id)
    const utmParameter = createUTMParameter(utmToken)

    // Create purchase URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const purchaseUrl = `${baseUrl}/purchase?utm=${utmParameter}`

    return NextResponse.json({
      success: true,
      token: utmParameter,
      url: purchaseUrl,
      business: {
        ...business,
        price,
        value,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate UTM token' },
      { status: 500 }
    )
  }
}
