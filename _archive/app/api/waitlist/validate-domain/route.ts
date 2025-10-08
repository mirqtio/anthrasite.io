import { NextRequest, NextResponse } from 'next/server'
import { validateDomain } from '@/lib/waitlist/domain-validation'
import { trackEvent } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    // Validate the domain
    const validationResult = await validateDomain(domain)

    if (!validationResult.isValid) {
      trackEvent('waitlist.domain_validation_failed', {
        domain: validationResult.normalizedDomain,
        error: validationResult.error,
        suggestion: validationResult.suggestion,
      })

      return NextResponse.json(
        {
          error: validationResult.error || 'Invalid domain',
          suggestion: validationResult.suggestion,
        },
        { status: 400 }
      )
    }

    trackEvent('waitlist.domain_validation_success', {
      domain: validationResult.normalizedDomain,
      hasActiveSite: validationResult.hasActiveSite,
      technologies: validationResult.technologies,
    })

    return NextResponse.json({
      normalizedDomain: validationResult.normalizedDomain,
      hasActiveSite: validationResult.hasActiveSite,
      technologies: validationResult.technologies,
      sslEnabled: validationResult.sslEnabled,
      wwwRedirect: validationResult.wwwRedirect,
      estimatedTraffic: validationResult.estimatedTraffic,
    })
  } catch (error) {
    console.error('Domain validation error:', error)
    return NextResponse.json(
      { error: 'Failed to validate domain' },
      { status: 500 }
    )
  }
}