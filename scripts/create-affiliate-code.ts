/**
 * Create an Affiliate referral code with full configuration options.
 *
 * Usage: npx tsx scripts/create-affiliate-code.ts <CODE> [options]
 *
 * Options (via environment variables or defaults):
 *   DISCOUNT_TYPE=fixed|percent (default: fixed)
 *   DISCOUNT_CENTS=<number> (default: 10000, i.e., $100)
 *   DISCOUNT_PERCENT=<number> (only if DISCOUNT_TYPE=percent)
 *   REWARD_TYPE=fixed|percent (default: fixed)
 *   REWARD_CENTS=<number> (default: 5000, i.e., $50)
 *   REWARD_PERCENT=<number> (only if REWARD_TYPE=percent)
 *   REWARD_TRIGGER=first|every (default: every)
 *   MAX_REDEMPTIONS=<number> (optional, unlimited if not set)
 *   MAX_REWARD_TOTAL_CENTS=<number> (optional lifetime cap)
 *   PERIOD_DAYS=<number> (optional period for rolling cap)
 *   MAX_REWARD_PER_PERIOD_CENTS=<number> (optional per-period cap)
 *
 * Example:
 *   npx tsx scripts/create-affiliate-code.ts PARTNER50
 *   DISCOUNT_TYPE=percent DISCOUNT_PERCENT=25 REWARD_CENTS=2500 npx tsx scripts/create-affiliate-code.ts AGENCY25
 */
import * as dotenv from 'dotenv'
dotenv.config()

import { getAdminClient } from '../lib/supabase/admin'
import { getOrCreateCoupon, createPromotionCode } from '../lib/stripe/referral'

async function main() {
  const code = process.argv[2]?.toUpperCase()

  if (!code) {
    console.error('Usage: npx tsx scripts/create-affiliate-code.ts <CODE>')
    console.error('See script comments for environment variable options')
    process.exit(1)
  }

  // Parse configuration from environment
  const discountType = (process.env.DISCOUNT_TYPE || 'fixed') as
    | 'fixed'
    | 'percent'
  const discountCents = parseInt(process.env.DISCOUNT_CENTS || '10000', 10)
  const discountPercent = parseInt(process.env.DISCOUNT_PERCENT || '0', 10)
  const rewardType = (process.env.REWARD_TYPE || 'fixed') as
    | 'fixed'
    | 'percent'
    | 'none'
  const rewardCents = parseInt(process.env.REWARD_CENTS || '5000', 10)
  const rewardPercent = parseInt(process.env.REWARD_PERCENT || '0', 10)
  const rewardTrigger = (process.env.REWARD_TRIGGER || 'every') as
    | 'first'
    | 'every'
  const maxRedemptions = process.env.MAX_REDEMPTIONS
    ? parseInt(process.env.MAX_REDEMPTIONS, 10)
    : null
  const maxRewardTotalCents = process.env.MAX_REWARD_TOTAL_CENTS
    ? parseInt(process.env.MAX_REWARD_TOTAL_CENTS, 10)
    : null
  const periodDays = process.env.PERIOD_DAYS
    ? parseInt(process.env.PERIOD_DAYS, 10)
    : null
  const maxRewardPerPeriodCents = process.env.MAX_REWARD_PER_PERIOD_CENTS
    ? parseInt(process.env.MAX_REWARD_PER_PERIOD_CENTS, 10)
    : null

  console.log(`Creating Affiliate code: ${code}`)
  console.log(
    `  Discount: ${discountType === 'fixed' ? `$${(discountCents / 100).toFixed(2)}` : `${discountPercent}%`}`
  )
  console.log(
    `  Reward: ${rewardType === 'none' ? 'None' : rewardType === 'fixed' ? `$${(rewardCents / 100).toFixed(2)}` : `${rewardPercent}%`} (${rewardTrigger})`
  )
  if (maxRedemptions) console.log(`  Max redemptions: ${maxRedemptions}`)
  if (maxRewardTotalCents)
    console.log(`  Lifetime cap: $${(maxRewardTotalCents / 100).toFixed(2)}`)
  if (periodDays && maxRewardPerPeriodCents) {
    console.log(
      `  Period cap: $${(maxRewardPerPeriodCents / 100).toFixed(2)} per ${periodDays} days`
    )
  }

  const supabase = getAdminClient()

  // Check if code already exists
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('id')
    .eq('code', code)
    .single()

  if (existing) {
    console.error(`\nCode ${code} already exists in database`)
    process.exit(1)
  }

  try {
    // Create Stripe coupon based on discount type
    const couponId =
      discountType === 'fixed'
        ? await getOrCreateCoupon('fixed', discountCents)
        : await getOrCreateCoupon('percent', discountPercent)
    console.log(`\nUsing Stripe coupon: ${couponId}`)

    // Create Stripe promotion code (with max redemptions if set)
    const promoCode = await createPromotionCode(
      code,
      couponId,
      maxRedemptions || undefined
    )
    console.log(`Created Stripe promotion code: ${promoCode.id}`)

    // Insert into database
    const { data: created, error } = await supabase
      .from('referral_codes')
      .insert({
        code,
        tier: 'affiliate',
        is_active: true,
        discount_type: discountType,
        discount_amount_cents: discountType === 'fixed' ? discountCents : null,
        discount_percent: discountType === 'percent' ? discountPercent : null,
        reward_type: rewardType,
        reward_amount_cents: rewardType === 'fixed' ? rewardCents : null,
        reward_percent: rewardType === 'percent' ? rewardPercent : null,
        reward_trigger: rewardTrigger,
        max_redemptions: maxRedemptions,
        max_reward_total_cents: maxRewardTotalCents,
        reward_period_days: periodDays,
        max_reward_per_period_cents: maxRewardPerPeriodCents,
        period_start_at: periodDays ? new Date().toISOString() : null,
        stripe_coupon_id: couponId,
        stripe_promotion_code_id: promoCode.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting code:', error.message)
      process.exit(1)
    }

    console.log(`\nAffiliate code created successfully!`)
    console.log(`  Code: ${code}`)
    console.log(`  Share URL: https://www.anthrasite.io/?promo=${code}`)
    console.log(`  DB ID: ${created.id}`)
  } catch (error) {
    console.error('Error creating code:', error)
    process.exit(1)
  }
}

main()
