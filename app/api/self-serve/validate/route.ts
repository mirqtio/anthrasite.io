import { NextRequest, NextResponse } from 'next/server'

const LEADSHOP_API_URL =
  process.env.LEADSHOP_API_URL || 'http://5.161.19.136:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(
      `${LEADSHOP_API_URL}/api/public/intake/validate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: body.url,
          email: body.email,
        }),
      }
    )

    const data = await response.json()

    // Forward the response as-is
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Self-serve validate error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Unable to validate URL. Please try again.' },
      { status: 500 }
    )
  }
}
