import { NextRequest, NextResponse } from 'next/server'
import { validateUTMToken } from '@/lib/utm/crypto'
// DB imports removed for stateless mock mode
// import { getUTMToken, markTokenUsed } from '@/lib/utm/storage'
import { withRateLimit } from '@/lib/utm/rate-limit'
import { withMonitoring } from '@/lib/monitoring/api-middleware'
import { sendAlert, AlertType, trackEvent } from '@/lib/monitoring'
// import { prisma } from '@/lib/db'

export interface ValidateUTMResponse {
  valid: boolean
  businessId?: string
  businessName?: string
  reportData?: any
  error?: string
}

async function validateUTMHandler(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract UTM parameter from query string
    const utm = req.nextUrl.searchParams.get('utm')

    if (!utm) {
      trackEvent('utm.validation.missing_parameter')
      return NextResponse.json<ValidateUTMResponse>(
        { valid: false, error: 'Missing UTM parameter' },
        { status: 400 }
      )
    }

    // Validate the token cryptographically
    const validation = await validateUTMToken(utm)

    if (!validation.valid) {
      trackEvent('utm.validation.failed', {
        reason: validation.reason,
      })

      // Different error messages for different failure reasons
      const errorMessages = {
        invalid_format: 'Invalid UTM format',
        invalid_signature: 'Invalid or tampered UTM',
        expired: 'This link has expired. Please request a new one.',
        invalid_payload: 'Corrupted UTM data',
      }

      return NextResponse.json<ValidateUTMResponse>(
        {
          valid: false,
          error: errorMessages[validation.reason!] || 'Invalid UTM',
        },
        { status: 400 }
      )
    }

    const payload = validation.payload!

    // Mock mode - skip database checks and return mock data
    const mockMode =
      (process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test' ||
        process.env.E2E === '1') &&
      process.env.USE_MOCK_PURCHASE === 'true'

    if (mockMode) {
      // In mock mode, skip one-time-use checks and return mock business data
      trackEvent('utm.validation.success', {
        businessId: payload.businessId,
        domain: 'mock-domain.com',
      })

      return NextResponse.json<ValidateUTMResponse>({
        valid: true,
        businessId: payload.businessId,
        businessName: 'Mock Business',
        reportData: {
          price: 49900,
          campaign_id: 'mock-campaign',
          business_id: payload.businessId,
        },
      })
    }

    // Check if token has been used (one-time use enforcement)
    // DB checks removed as part of WIP artifact cleanup
    // const storedToken = await getUTMToken(payload.nonce)

    // Mock response for valid tokens (Stateless Mode)
    // Since 'Business' and 'UtmToken' models are WIP and removed from schema,
    // we return static data to allow the frontend to render for dev/preview.
    const mockReportData = {
      score: 72,
      issues: 8,
      estimatedValue: 12450,
      price: 39900,
    }

    // Track successful validation
    trackEvent('utm.validation.success', {
      businessId: payload.businessId,
      stateless: true,
    })

    return NextResponse.json<ValidateUTMResponse>({
      valid: true,
      businessId: payload.businessId,
      businessName: 'Demo Business Inc', // Placeholder
      reportData: mockReportData,
    })
  } catch (error) {
    sendAlert(AlertType.UTM_VALIDATION_FAILED, {
      error: (error as Error).message,
    })

    return NextResponse.json<ValidateUTMResponse>(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Apply rate limiting and monitoring
export const GET = withRateLimit(
  withMonitoring(validateUTMHandler, 'validate_utm', {
    alertOnError: true,
    alertThreshold: 1000, // Alert if validation takes > 1s
  })
)
