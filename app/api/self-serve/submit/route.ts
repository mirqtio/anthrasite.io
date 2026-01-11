import { NextRequest, NextResponse } from 'next/server'

const LEADSHOP_API_URL =
  process.env.LEADSHOP_API_URL || 'http://5.161.19.136:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(
      `${LEADSHOP_API_URL}/api/public/intake/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: body.url,
          email: body.email,
          cache_key: body.cache_key,
          company: body.company,
          city: body.city,
          state: body.state,
          zip: body.zip,
          industry: body.industry,
          revenue_range: body.revenue_range,
          accepted_terms: body.accepted_terms,
          marketing_opt_in: body.marketing_opt_in,
        }),
      }
    )

    const data = await response.json()

    // Forward the response as-is
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Self-serve submit error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unable to submit request. Please try again.',
      },
      { status: 500 }
    )
  }
}
