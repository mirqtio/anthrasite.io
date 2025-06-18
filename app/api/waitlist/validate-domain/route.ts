import { NextRequest, NextResponse } from 'next/server'
import { validateDomain, normalizeDomain } from '@/lib/waitlist/domain-validation'
import { withRateLimit } from '@/lib/utm/rate-limit'

async function handleDomainValidation(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }
    
    // In test/development mode, skip DNS validation for faster tests
    if (process.env.NODE_ENV !== 'production') {
      const normalized = normalizeDomain(domain)
      
      // Basic format validation
      if (!normalized || normalized.length < 3 || !normalized.includes('.')) {
        return NextResponse.json(
          { error: 'Invalid domain format' },
          { status: 400 }
        )
      }
      
      return NextResponse.json({
        success: true,
        normalizedDomain: normalized,
      })
    }
    
    // Production: full validation
    const result = await validateDomain(domain)
    
    if (!result.isValid) {
      return NextResponse.json(
        {
          error: result.error || 'Invalid domain',
          suggestion: result.suggestion,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      normalizedDomain: result.normalizedDomain,
    })
  } catch (error) {
    console.error('Domain validation error:', error)
    
    return NextResponse.json(
      { error: 'Unable to validate domain' },
      { status: 500 }
    )
  }
}

// POST /api/waitlist/validate-domain - Validate domain
export const POST = withRateLimit(handleDomainValidation)