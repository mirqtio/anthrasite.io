import { NextRequest, NextResponse } from 'next/server'
import { validateUTMToken } from '@/lib/utm/crypto'
import { getUTMToken, markTokenUsed } from '@/lib/utm/storage'
import { withRateLimit } from '@/lib/utm/rate-limit'
import { withMonitoring } from '@/lib/monitoring/api-middleware'
import { sendAlert, AlertType, trackEvent } from '@/lib/monitoring'
import { prisma } from '@/lib/db'

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
          error: errorMessages[validation.reason!] || 'Invalid UTM'
        },
        { status: 400 }
      )
    }
    
    const payload = validation.payload!
    
    // Check if token has been used (one-time use enforcement)
    const storedToken = await getUTMToken(payload.nonce)
    
    if (!storedToken) {
      trackEvent('utm.validation.token_not_found', {
        nonce: payload.nonce,
      })
      return NextResponse.json<ValidateUTMResponse>(
        { valid: false, error: 'Invalid UTM token' },
        { status: 400 }
      )
    }
    
    if (storedToken.usedAt) {
      trackEvent('utm.validation.token_already_used', {
        nonce: payload.nonce,
        usedAt: storedToken.usedAt,
      })
      return NextResponse.json<ValidateUTMResponse>(
        { valid: false, error: 'This link has already been used' },
        { status: 400 }
      )
    }
    
    // Mark token as used
    const marked = await markTokenUsed(payload.nonce)
    if (!marked) {
      // Race condition - token was just used by another request
      trackEvent('utm.validation.race_condition', {
        nonce: payload.nonce,
      })
      return NextResponse.json<ValidateUTMResponse>(
        { valid: false, error: 'This link has already been used' },
        { status: 400 }
      )
    }
    
    // Fetch business data
    const business = await prisma.business.findUnique({
      where: { id: payload.businessId },
      select: {
        id: true,
        name: true,
        domain: true,
        reportData: true,
      },
    })
    
    if (!business) {
      sendAlert(AlertType.UTM_VALIDATION_FAILED, {
        reason: 'business_not_found',
        businessId: payload.businessId,
      })
      return NextResponse.json<ValidateUTMResponse>(
        { valid: false, error: 'Business not found' },
        { status: 404 }
      )
    }
    
    // Track successful validation
    trackEvent('utm.validation.success', {
      businessId: business.id,
      domain: business.domain,
    })
    
    // Return business data for purchase page
    return NextResponse.json<ValidateUTMResponse>({
      valid: true,
      businessId: business.id,
      businessName: business.name,
      reportData: business.reportData,
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