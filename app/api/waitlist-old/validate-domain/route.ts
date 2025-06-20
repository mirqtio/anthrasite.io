import { NextRequest, NextResponse } from 'next/server'
import {
  validateDomain,
  normalizeDomain,
} from '@/lib/waitlist/domain-validation'
import { withRateLimit } from '@/lib/utm/rate-limit'

async function handleDomainValidation(request: Request) {
  try {
    let body: any
    try {
      body = await request.json()
    } catch (jsonError) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { domain } = body

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Always use validateDomain - it will be mocked in tests
    const result = await validateDomain(domain)

    if (!result.isValid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.error || 'Invalid domain',
          suggestion: result.suggestion,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      valid: true,
      normalized: result.normalizedDomain,
      hasActiveSite: result.hasActiveSite,
      technologies: result.technologies,
      sslEnabled: result.sslEnabled,
      wwwRedirect: result.wwwRedirect,
      estimatedTraffic: result.estimatedTraffic,
    })
  } catch (error) {
    console.error('Domain validation error:', error)

    return NextResponse.json(
      { error: 'Failed to validate domain' },
      { status: 500 }
    )
  }
}

// POST /api/waitlist/validate-domain - Validate domain
export const POST = withRateLimit(handleDomainValidation)
