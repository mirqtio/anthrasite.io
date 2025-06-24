import { NextRequest, NextResponse } from 'next/server'
import { addToWaitlist, getWaitlistStats } from '@/lib/waitlist/service'
import { validateEmail } from '@/lib/waitlist/domain-validation'
import { trackEvent } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, email, referralSource } = body

    // Basic validation
    if (!domain || !email) {
      return NextResponse.json(
        { error: 'Domain and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Add to waitlist using the service
    const result = await addToWaitlist({
      domain,
      email,
      referralSource,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    // Track successful signup
    trackEvent('api.waitlist_signup', {
      domain,
      position: result.position?.position,
    })

    return NextResponse.json({
      success: true,
      position: result.position,
      normalizedDomain: domain,
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    trackEvent('api.waitlist_signup_error', {
      error: (error as Error).message,
    })
    
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get waitlist statistics
    const stats = await getWaitlistStats()
    
    return NextResponse.json({
      count: stats.totalCount,
      todayCount: stats.todayCount,
      weekCount: stats.weekCount,
    })
  } catch (error) {
    console.error('Waitlist stats error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get waitlist stats' },
      { status: 500 }
    )
  }
}