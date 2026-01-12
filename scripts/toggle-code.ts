/**
 * Enable or disable a referral code.
 *
 * Usage: npx tsx scripts/toggle-code.ts <CODE> <enable|disable>
 *
 * Example:
 *   npx tsx scripts/toggle-code.ts ACMECORP disable
 *   npx tsx scripts/toggle-code.ts ACMECORP enable
 */
import * as dotenv from 'dotenv'
dotenv.config()

import { getAdminClient } from '../lib/supabase/admin'
import { stripe } from '../lib/stripe/config'

async function main() {
  const code = process.argv[2]?.toUpperCase()
  const action = process.argv[3]?.toLowerCase()

  if (!code || !action || !['enable', 'disable'].includes(action)) {
    console.error(
      'Usage: npx tsx scripts/toggle-code.ts <CODE> <enable|disable>'
    )
    console.error('Example: npx tsx scripts/toggle-code.ts ACMECORP disable')
    process.exit(1)
  }

  const isActive = action === 'enable'
  console.log(`${isActive ? 'Enabling' : 'Disabling'} code: ${code}`)

  const supabase = getAdminClient()

  // Find the code
  const { data: existing, error: findError } = await supabase
    .from('referral_codes')
    .select('id, is_active, stripe_promotion_code_id')
    .eq('code', code)
    .single()

  if (findError || !existing) {
    console.error(`Code ${code} not found`)
    process.exit(1)
  }

  if (existing.is_active === isActive) {
    console.log(`Code ${code} is already ${isActive ? 'enabled' : 'disabled'}`)
    process.exit(0)
  }

  try {
    // Update Stripe promotion code if it exists
    if (existing.stripe_promotion_code_id) {
      await stripe.promotionCodes.update(existing.stripe_promotion_code_id, {
        active: isActive,
      })
      console.log(
        `Updated Stripe promotion code: ${existing.stripe_promotion_code_id}`
      )
    }

    // Update database
    const { error: updateError } = await supabase
      .from('referral_codes')
      .update({ is_active: isActive })
      .eq('id', existing.id)

    if (updateError) {
      console.error('Error updating code:', updateError.message)
      process.exit(1)
    }

    console.log(`\nCode ${code} has been ${isActive ? 'enabled' : 'disabled'}`)
  } catch (error) {
    console.error('Error toggling code:', error)
    process.exit(1)
  }
}

main()
