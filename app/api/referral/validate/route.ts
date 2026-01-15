import { NextRequest, NextResponse } from 'next/server'
import {
  validateReferralCode,
  formatDiscount,
  calculateDiscountedPrice,
} from '@/lib/referral/validation'
import { REPORT_PRICE } from '@/lib/stripe/config'

/**
 * GET /api/referral/validate?code=ACMECORP
 *
 * Public endpoint for validating referral codes.
 * Used by homepage to show toast on valid code arrival.
 *
 * Rate limiting should be added in production (via middleware or edge config).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ valid: false, reason: 'missing_code' })
  }

  try {
    const result = await validateReferralCode(code)

    if (!result.valid) {
      return NextResponse.json({
        valid: false,
        reason: result.reason,
      })
    }

    // Calculate discounted price for display
    const discountedPriceCents = result.code
      ? calculateDiscountedPrice(REPORT_PRICE.amount, result.code)
      : REPORT_PRICE.amount

    return NextResponse.json({
      valid: true,
      code: result.code?.code,
      discountDisplay: result.discountDisplay,
      referrerName: result.code?.company_name || null,
      originalPriceCents: REPORT_PRICE.amount,
      discountedPriceCents,
    })
  } catch (error) {
    console.error('[referral/validate] Error:', error)
    return NextResponse.json(
      { valid: false, reason: 'server_error' },
      { status: 500 }
    )
  }
}
