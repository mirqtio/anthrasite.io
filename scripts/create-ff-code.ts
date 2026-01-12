/**
 * Create a Friends & Family referral code.
 *
 * Usage: npx tsx scripts/create-ff-code.ts <CODE> [discountCents=10000]
 *
 * Example:
 *   npx tsx scripts/create-ff-code.ts FRIENDS100
 *   npx tsx scripts/create-ff-code.ts VIP50 5000
 */
import * as dotenv from 'dotenv'
dotenv.config()

import { getAdminClient } from '../lib/supabase/admin'
import { getOrCreateCoupon, createPromotionCode } from '../lib/stripe/referral'

async function main() {
  const code = process.argv[2]?.toUpperCase()
  const discountCents = parseInt(process.argv[3] || '10000', 10)

  if (!code) {
    console.error(
      'Usage: npx tsx scripts/create-ff-code.ts <CODE> [discountCents]'
    )
    console.error('Example: npx tsx scripts/create-ff-code.ts FRIENDS100')
    process.exit(1)
  }

  if (discountCents < 100 || discountCents > 19900) {
    console.error(
      'Discount must be between $1.00 (100) and $199.00 (19900) cents'
    )
    process.exit(1)
  }

  console.log(
    `Creating F&F code: ${code} with $${(discountCents / 100).toFixed(2)} off`
  )

  const supabase = getAdminClient()

  // Check if code already exists
  const { data: existing } = await supabase
    .from('referral_codes')
    .select('id')
    .eq('code', code)
    .single()

  if (existing) {
    console.error(`Code ${code} already exists in database`)
    process.exit(1)
  }

  try {
    // Create Stripe coupon (or get existing)
    const couponId = await getOrCreateCoupon('fixed', discountCents)
    console.log(`Using Stripe coupon: ${couponId}`)

    // Create Stripe promotion code
    const promoCode = await createPromotionCode(code, couponId)
    console.log(`Created Stripe promotion code: ${promoCode.id}`)

    // Insert into database
    const { data: created, error } = await supabase
      .from('referral_codes')
      .insert({
        code,
        tier: 'friends_family',
        is_active: true,
        discount_type: 'fixed',
        discount_amount_cents: discountCents,
        reward_type: 'none',
        reward_amount_cents: 0,
        stripe_coupon_id: couponId,
        stripe_promotion_code_id: promoCode.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting code:', error.message)
      process.exit(1)
    }

    console.log(`\nF&F code created successfully!`)
    console.log(`  Code: ${code}`)
    console.log(`  Discount: $${(discountCents / 100).toFixed(2)} off`)
    console.log(`  Share URL: https://www.anthrasite.io/?promo=${code}`)
    console.log(`  DB ID: ${created.id}`)
  } catch (error) {
    console.error('Error creating code:', error)
    process.exit(1)
  }
}

main()
