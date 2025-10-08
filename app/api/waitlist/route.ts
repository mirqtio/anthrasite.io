import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { withMonitoring } from '@/lib/monitoring/api-middleware'
import { trackEvent } from '@/lib/monitoring'

async function waitlistHandler(req: NextRequest): Promise<NextResponse> {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { email, domain } = body

    // Validate required fields
    if (!email || !domain) {
      trackEvent('waitlist.validation.missing_fields')
      return NextResponse.json(
        { error: 'Email and domain are required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      trackEvent('waitlist.validation.invalid_email')
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email,
        domain,
        // Optional fields can be added later (ipLocation, variantData, etc.)
      },
    })

    trackEvent('waitlist.signup.success', {
      domain,
      entryId: entry.id,
    })

    return NextResponse.json(
      {
        success: true,
        id: entry.id,
        position: entry.position,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Waitlist signup error:', error)
    trackEvent('waitlist.signup.error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}

export const POST = withMonitoring(waitlistHandler, 'waitlist.signup')
