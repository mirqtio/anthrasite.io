import { NextRequest, NextResponse } from 'next/server'

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
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { businessId } = body

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      )
    }

    // Generate a custom mock UTM token for specific business
    const mockToken = `dev-utm-custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      token: mockToken,
      businessId,
      purchaseUrl: `/purchase?utm=${mockToken}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      note: 'Custom development UTM token generated',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate custom UTM token' },
      { status: 500 }
    )
  }
}
