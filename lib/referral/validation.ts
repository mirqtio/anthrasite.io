import { getAdminClient } from '@/lib/supabase/admin'

/**
 * Referral Code Validation
 *
 * Server-side validation logic for referral codes.
 * Used by both the validation endpoint and checkout.
 */

export interface ReferralCode {
  id: string
  code: string
  stripe_promotion_code_id: string | null
  stripe_coupon_id: string | null
  tier: 'standard' | 'friends_family' | 'affiliate'
  is_active: boolean
  discount_type: 'fixed' | 'percent'
  discount_amount_cents: number | null
  discount_percent: number | null
  reward_type: 'fixed' | 'percent' | 'none'
  reward_amount_cents: number | null
  reward_percent: number | null
  reward_trigger: 'first' | 'every'
  max_redemptions: number | null
  redemption_count: number
  max_reward_total_cents: number | null
  max_reward_per_period_cents: number | null
  reward_period_days: number | null
  total_reward_paid_cents: number
  period_reward_paid_cents: number
  pending_payout_cents: number
  period_start_at: string | null
  sale_id: number | null
  lead_id: number | null
  company_name: string | null
  expires_at: string | null
}

export interface ValidationResult {
  valid: boolean
  reason?: string
  code?: ReferralCode
  discountDisplay?: string
}

/**
 * Get config value from referral_config table
 */
export async function getConfig<T>(key: string, defaultValue: T): Promise<T> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('referral_config')
    .select('value')
    .eq('key', key)
    .single()
  return (data?.value as T) ?? defaultValue
}

/**
 * Check if Friends & Family codes are globally enabled
 */
export async function isFriendsAndFamilyEnabled(): Promise<boolean> {
  return getConfig('ff_enabled', true)
}

/**
 * Format discount for display
 */
export function formatDiscount(code: ReferralCode): string {
  if (code.discount_type === 'fixed' && code.discount_amount_cents) {
    return `$${(code.discount_amount_cents / 100).toFixed(0)} off`
  }
  if (code.discount_type === 'percent' && code.discount_percent) {
    return `${code.discount_percent}% off`
  }
  return 'Discount applied'
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(
  originalPriceCents: number,
  code: ReferralCode
): number {
  if (code.discount_type === 'fixed' && code.discount_amount_cents) {
    return Math.max(0, originalPriceCents - code.discount_amount_cents)
  }
  if (code.discount_type === 'percent' && code.discount_percent) {
    const discount = Math.round(
      (originalPriceCents * code.discount_percent) / 100
    )
    return Math.max(0, originalPriceCents - discount)
  }
  return originalPriceCents
}

/**
 * Validates a referral code for use.
 * Returns validation result with code details if valid.
 */
export async function validateReferralCode(
  codeString: string
): Promise<ValidationResult> {
  const supabase = getAdminClient()

  // Look up the code
  const { data: code, error } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('code', codeString.toUpperCase())
    .single()

  if (error || !code) {
    return { valid: false, reason: 'not_found' }
  }

  // Check if code is active
  if (!code.is_active) {
    return { valid: false, reason: 'disabled' }
  }

  // Check expiration
  if (code.expires_at && new Date(code.expires_at) < new Date()) {
    return { valid: false, reason: 'expired' }
  }

  // Check redemption limit
  if (
    code.max_redemptions !== null &&
    code.redemption_count >= code.max_redemptions
  ) {
    return { valid: false, reason: 'max_redemptions' }
  }

  // Check F&F global toggle
  if (code.tier === 'friends_family') {
    const ffEnabled = await isFriendsAndFamilyEnabled()
    if (!ffEnabled) {
      return { valid: false, reason: 'ff_disabled' }
    }
  }

  // Code is valid
  return {
    valid: true,
    code: code as ReferralCode,
    discountDisplay: formatDiscount(code as ReferralCode),
  }
}

/**
 * Validates referral code for checkout.
 * Additionally checks for self-referral.
 */
export async function validateForCheckout(
  codeString: string,
  refereeLeadId?: number,
  refereeEmail?: string
): Promise<ValidationResult> {
  const result = await validateReferralCode(codeString)

  if (!result.valid || !result.code) {
    return result
  }

  const code = result.code

  // Self-referral check: same lead_id
  if (refereeLeadId && code.lead_id && refereeLeadId === code.lead_id) {
    return { valid: false, reason: 'self_referral' }
  }

  // Self-referral check: same email (need to look up referrer's email)
  if (refereeEmail && code.sale_id) {
    const supabase = getAdminClient()
    const { data: sale } = await supabase
      .from('sales')
      .select('customer_email')
      .eq('id', code.sale_id)
      .single()

    if (
      sale?.customer_email &&
      sale.customer_email.toLowerCase() === refereeEmail.toLowerCase()
    ) {
      return { valid: false, reason: 'self_referral' }
    }
  }

  return result
}

/**
 * Look up referral code by Stripe promotion code ID
 */
export async function getReferralCodeByStripePromoId(
  stripePromoId: string
): Promise<ReferralCode | null> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from('referral_codes')
    .select('*')
    .eq('stripe_promotion_code_id', stripePromoId)
    .single()

  return data as ReferralCode | null
}
