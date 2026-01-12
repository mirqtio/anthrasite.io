import { getAdminClient } from '@/lib/supabase/admin'
import { issueRefundPayout, getRefundCapacity } from '@/lib/stripe/referral'
import type { ReferralCode } from './validation'

/**
 * Referral Payout Logic
 *
 * Calculates rewards and executes payouts via Stripe refunds.
 */

export interface PayoutCalculation {
  earnedCents: number
  payableCents: number
  reason: string
  skipPayout: boolean
}

/**
 * Check if period should reset and reset if needed
 */
async function checkAndResetPeriod(code: ReferralCode): Promise<ReferralCode> {
  if (!code.reward_period_days) return code

  const supabase = getAdminClient()

  // If no period start, start now
  if (!code.period_start_at) {
    const { data } = await supabase
      .from('referral_codes')
      .update({
        period_start_at: new Date().toISOString(),
        period_reward_paid_cents: 0,
      })
      .eq('id', code.id)
      .select()
      .single()
    return data as ReferralCode
  }

  // Check if period has expired
  const periodStart = new Date(code.period_start_at)
  const periodEnd = new Date(periodStart)
  periodEnd.setDate(periodEnd.getDate() + code.reward_period_days)

  if (new Date() > periodEnd) {
    // Reset period
    const { data } = await supabase
      .from('referral_codes')
      .update({
        period_start_at: new Date().toISOString(),
        period_reward_paid_cents: 0,
      })
      .eq('id', code.id)
      .select()
      .single()
    console.log(`[payout] Reset period for code ${code.code}`)
    return data as ReferralCode
  }

  return code
}

/**
 * Calculate reward amount for a conversion
 */
export async function calculateReward(
  code: ReferralCode,
  salePriceCents: number,
  isFirstConversion: boolean
): Promise<PayoutCalculation> {
  // No reward for F&F or if reward_type is none
  if (code.tier === 'friends_family' || code.reward_type === 'none') {
    return {
      earnedCents: 0,
      payableCents: 0,
      reason: 'no_reward_configured',
      skipPayout: true,
    }
  }

  // Check reward trigger
  if (code.reward_trigger === 'first' && !isFirstConversion) {
    return {
      earnedCents: 0,
      payableCents: 0,
      reason: 'first_only_already_paid',
      skipPayout: true,
    }
  }

  // Calculate base reward
  let earnedCents = 0
  if (code.reward_type === 'fixed' && code.reward_amount_cents) {
    earnedCents = code.reward_amount_cents
  } else if (code.reward_type === 'percent' && code.reward_percent) {
    earnedCents = Math.round((salePriceCents * code.reward_percent) / 100)
  }

  if (earnedCents === 0) {
    return {
      earnedCents: 0,
      payableCents: 0,
      reason: 'zero_reward',
      skipPayout: true,
    }
  }

  // Check and reset period if needed (for affiliates)
  const updatedCode = await checkAndResetPeriod(code)

  // Apply lifetime cap
  let payableCents = earnedCents
  if (updatedCode.max_reward_total_cents !== null) {
    const remainingLifetime =
      updatedCode.max_reward_total_cents - updatedCode.total_reward_paid_cents
    if (remainingLifetime <= 0) {
      return {
        earnedCents,
        payableCents: 0,
        reason: 'lifetime_cap_reached',
        skipPayout: true,
      }
    }
    payableCents = Math.min(payableCents, remainingLifetime)
  }

  // Apply period cap
  if (updatedCode.max_reward_per_period_cents !== null) {
    const remainingPeriod =
      updatedCode.max_reward_per_period_cents -
      updatedCode.period_reward_paid_cents
    if (remainingPeriod <= 0) {
      return {
        earnedCents,
        payableCents: 0,
        reason: 'period_cap_reached',
        skipPayout: true,
      }
    }
    payableCents = Math.min(payableCents, remainingPeriod)
  }

  return {
    earnedCents,
    payableCents,
    reason: payableCents < earnedCents ? 'capped' : 'full_reward',
    skipPayout: false,
  }
}

export interface PayoutResult {
  success: boolean
  method: 'refund' | 'pending_manual' | null
  amountPaidCents: number
  pendingCents: number
  refundId?: string
  error?: string
}

/**
 * Execute payout for a conversion
 */
export async function executePayout(
  code: ReferralCode,
  conversionId: string,
  payableCents: number,
  referrerPaymentIntentId: string
): Promise<PayoutResult> {
  if (payableCents <= 0) {
    return {
      success: true,
      method: null,
      amountPaidCents: 0,
      pendingCents: 0,
    }
  }

  // Check refund capacity
  const capacity = await getRefundCapacity(referrerPaymentIntentId)

  if (capacity <= 0) {
    // No refund capacity, mark as pending
    return {
      success: true,
      method: 'pending_manual',
      amountPaidCents: 0,
      pendingCents: payableCents,
    }
  }

  // Determine how much we can refund
  const refundAmount = Math.min(payableCents, capacity)
  const pendingAmount = payableCents - refundAmount

  // Issue refund
  const refundResult = await issueRefundPayout(
    referrerPaymentIntentId,
    refundAmount,
    conversionId,
    `Referral reward for code ${code.code}`
  )

  if (!refundResult) {
    return {
      success: false,
      method: null,
      amountPaidCents: 0,
      pendingCents: payableCents,
      error: 'Refund failed',
    }
  }

  return {
    success: true,
    method: pendingAmount > 0 ? 'pending_manual' : 'refund',
    amountPaidCents: refundResult.amountRefunded,
    pendingCents: pendingAmount,
    refundId: refundResult.refundId,
  }
}

/**
 * Update referral_codes tracking after payout
 */
export async function updateCodeTracking(
  codeId: string,
  amountPaidCents: number,
  pendingCents: number
): Promise<void> {
  const supabase = getAdminClient()

  // Use raw SQL for atomic increment
  await supabase.rpc('increment_referral_payout', {
    code_id: codeId,
    paid_cents: amountPaidCents,
    pending_cents: pendingCents,
  })
}

/**
 * Record a conversion in the database
 */
export async function recordConversion(params: {
  referrerCodeId: string
  refereeSaleId: number
  refereeLeadId?: number
  stripePromotionCodeId?: string
  stripeCheckoutSessionId?: string
  discountAppliedCents: number
  rewardEarnedCents: number
  rewardPaidCents: number
  payoutStatus: 'pending' | 'paid' | 'failed' | 'skipped'
  payoutMethod?: 'refund' | 'pending_manual'
  stripeRefundId?: string
  payoutError?: string
}): Promise<string | null> {
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from('referral_conversions')
    .upsert(
      {
        referrer_code_id: params.referrerCodeId,
        referee_sale_id: params.refereeSaleId,
        referee_lead_id: params.refereeLeadId,
        stripe_promotion_code_id: params.stripePromotionCodeId,
        stripe_checkout_session_id: params.stripeCheckoutSessionId,
        discount_applied_cents: params.discountAppliedCents,
        reward_earned_cents: params.rewardEarnedCents,
        reward_paid_cents: params.rewardPaidCents,
        payout_status: params.payoutStatus,
        payout_method: params.payoutMethod,
        stripe_refund_id: params.stripeRefundId,
        payout_error: params.payoutError,
        ...(params.payoutStatus === 'paid' && {
          paid_at: new Date().toISOString(),
        }),
      },
      {
        onConflict: 'referrer_code_id,referee_sale_id',
      }
    )
    .select('id')
    .single()

  if (error) {
    console.error('[payout] Failed to record conversion:', error)
    return null
  }

  return data.id
}

/**
 * Increment redemption count for a code
 */
export async function incrementRedemptionCount(codeId: string): Promise<void> {
  const supabase = getAdminClient()

  await supabase.rpc('increment_redemption_count', {
    code_id: codeId,
  })
}
