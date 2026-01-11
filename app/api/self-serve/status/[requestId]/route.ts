import { NextRequest, NextResponse } from 'next/server'

const LEADSHOP_API_URL =
  process.env.LEADSHOP_API_URL || 'http://5.161.19.136:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params

    const response = await fetch(
      `${LEADSHOP_API_URL}/api/public/request/${requestId}/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    // Forward the response as-is
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Self-serve status error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Unable to get status. Please try again.' },
      { status: 500 }
    )
  }
}
