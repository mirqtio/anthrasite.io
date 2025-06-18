import { NextRequest, NextResponse } from 'next/server'
import { validateDomain, validateEmail } from '@/lib/waitlist/domain-validation'
import { addToWaitlist, getWaitlistPosition } from '@/lib/waitlist/service'
import { withRateLimit } from '@/lib/utm/rate-limit'
import { withMonitoring } from '@/lib/monitoring/api-middleware'

async function handleWaitlistSignup(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain, email, referralSource } = body
    
    // Validate required fields
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
    
    // Validate domain
    const domainValidation = await validateDomain(domain)
    
    if (!domainValidation.isValid) {
      return NextResponse.json(
        {
          error: domainValidation.error || 'Invalid domain',
          suggestion: domainValidation.suggestion,
        },
        { status: 400 }
      )
    }
    
    // Add to waitlist
    const result = await addToWaitlist({
      domain: domainValidation.normalizedDomain,
      email,
      referralSource,
    })
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      position: result.position,
      normalizedDomain: domainValidation.normalizedDomain,
    })
  } catch (error) {
    console.error('Waitlist signup error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleGetPosition(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }
    
    const position = await getWaitlistPosition(domain)
    
    if (!position) {
      return NextResponse.json(
        { error: 'Domain not found in waitlist' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      position,
    })
  } catch (error) {
    console.error('Get position error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/waitlist - Add to waitlist
export const POST = withRateLimit(
  withMonitoring(handleWaitlistSignup, 'waitlist_signup', {
    alertOnError: true,
    alertThreshold: 5000,
  })
)

// GET /api/waitlist - Get position
export const GET = withRateLimit(
  withMonitoring(handleGetPosition, 'waitlist_position', {
    alertOnError: true,
    alertThreshold: 2000,
  })
)