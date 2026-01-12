// types/referral-admin.ts

// ----------------------------------------------------------------------
// 1. Read Models for Referral Admin UI
// ----------------------------------------------------------------------

/**
 * Row from referral_codes table for admin list view
 */
export interface ReferralCodeRow {
  id: string
  code: string
  tier: 'standard' | 'friends_family' | 'affiliate'
  is_active: boolean

  // Discount configuration (what referee gets)
  discount_type: 'fixed' | 'percent'
  discount_amount_cents: number | null
  discount_percent: number | null

  // Reward configuration (what referrer earns)
  reward_type: 'fixed' | 'percent' | 'none'
  reward_amount_cents: number | null
  reward_percent: number | null
  reward_trigger: 'first' | 'every'

  // Usage limits
  max_redemptions: number | null
  redemption_count: number

  // Reward caps (for affiliates)
  max_reward_total_cents: number | null
  total_reward_paid_cents: number
  max_reward_per_period_cents: number | null
  period_reward_paid_cents: number
  reward_period_days: number | null
  period_start_at: string | null
  pending_payout_cents: number

  // Stripe integration
  stripe_promotion_code_id: string | null
  stripe_coupon_id: string | null

  // Origin (null for F&F and manually created affiliates)
  sale_id: number | null
  lead_id: number | null
  company_name: string | null

  // Metadata
  notes: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Row from referral_conversions table for admin list view
 */
export interface ConversionRow {
  id: string
  referrer_code_id: string
  referee_sale_id: number
  referee_lead_id: number | null

  // Joined fields for display
  referrer_code: string
  referee_company: string | null
  referee_email: string | null

  // Amounts
  discount_applied_cents: number
  reward_earned_cents: number
  reward_paid_cents: number

  // Payout tracking
  payout_status: 'pending' | 'paid' | 'failed' | 'skipped'
  payout_method: 'refund' | 'pending_manual' | null
  stripe_refund_id: string | null
  payout_error: string | null
  paid_at: string | null

  created_at: string
}

/**
 * Global referral config keys and their types
 */
export interface ReferralConfigMap {
  ff_enabled: boolean
  default_standard_discount_cents: number
  default_standard_reward_cents: number
  default_ff_discount_cents: number
  default_affiliate_discount_cents: number
  default_affiliate_reward_percent: number
}

export type ReferralConfigKey = keyof ReferralConfigMap

// ----------------------------------------------------------------------
// 2. Input Types for Server Actions
// ----------------------------------------------------------------------

export type TierType = 'standard' | 'friends_family' | 'affiliate'
export type DiscountType = 'fixed' | 'percent'
export type RewardType = 'fixed' | 'percent' | 'none'
export type RewardTrigger = 'first' | 'every'

export interface CreateCodeInput {
  code: string
  tier: TierType
  discount_type: DiscountType
  discount_amount_cents?: number
  discount_percent?: number
  reward_type: RewardType
  reward_amount_cents?: number
  reward_percent?: number
  reward_trigger?: RewardTrigger
  max_redemptions?: number
  max_reward_total_cents?: number
  max_reward_per_period_cents?: number
  reward_period_days?: number
  expires_at?: string
  notes?: string
}

export interface UpdateCodeInput {
  is_active?: boolean
  max_redemptions?: number
  max_reward_total_cents?: number
  max_reward_per_period_cents?: number
  reward_period_days?: number
  expires_at?: string | null
  notes?: string
}

// ----------------------------------------------------------------------
// 3. Display Helpers
// ----------------------------------------------------------------------

/**
 * Format discount for display (e.g., "$100 off" or "25% off")
 */
export function formatDiscountDisplay(code: ReferralCodeRow): string {
  if (code.discount_type === 'fixed' && code.discount_amount_cents) {
    return `$${(code.discount_amount_cents / 100).toFixed(0)} off`
  }
  if (code.discount_type === 'percent' && code.discount_percent) {
    return `${code.discount_percent}% off`
  }
  return 'Discount'
}

/**
 * Format reward for display (e.g., "$100", "10%", or "None")
 */
export function formatRewardDisplay(code: ReferralCodeRow): string {
  if (code.reward_type === 'none') {
    return 'None'
  }
  if (code.reward_type === 'fixed' && code.reward_amount_cents) {
    const trigger = code.reward_trigger === 'first' ? ' (first)' : ''
    return `$${(code.reward_amount_cents / 100).toFixed(0)}${trigger}`
  }
  if (code.reward_type === 'percent' && code.reward_percent) {
    const trigger = code.reward_trigger === 'first' ? ' (first)' : ''
    return `${code.reward_percent}%${trigger}`
  }
  return 'None'
}

/**
 * Format usage display (e.g., "5/10" or "5")
 */
export function formatUsageDisplay(code: ReferralCodeRow): string {
  if (code.max_redemptions !== null) {
    return `${code.redemption_count}/${code.max_redemptions}`
  }
  return `${code.redemption_count}`
}

/**
 * Format payout display for affiliates (e.g., "$300/$1000")
 */
export function formatPayoutDisplay(code: ReferralCodeRow): string {
  const paid = `$${(code.total_reward_paid_cents / 100).toFixed(0)}`
  if (code.max_reward_total_cents !== null) {
    return `${paid}/$${(code.max_reward_total_cents / 100).toFixed(0)}`
  }
  return paid
}

/**
 * Format cents as dollars for display
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
