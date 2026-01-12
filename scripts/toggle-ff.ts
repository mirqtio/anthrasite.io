/**
 * Toggle the global Friends & Family feature flag.
 *
 * This controls whether F&F tier codes can be used at checkout.
 * Individual code is_active status is still respected.
 *
 * Usage: npx tsx scripts/toggle-ff.ts <enable|disable>
 *
 * Example:
 *   npx tsx scripts/toggle-ff.ts disable  # Disable all F&F codes globally
 *   npx tsx scripts/toggle-ff.ts enable   # Re-enable F&F codes globally
 */
import * as dotenv from 'dotenv'
dotenv.config()

import { getAdminClient } from '../lib/supabase/admin'

async function main() {
  const action = process.argv[2]?.toLowerCase()

  if (!action || !['enable', 'disable'].includes(action)) {
    console.error('Usage: npx tsx scripts/toggle-ff.ts <enable|disable>')
    console.error('Example: npx tsx scripts/toggle-ff.ts disable')
    process.exit(1)
  }

  const ffEnabled = action === 'enable'
  console.log(
    `${ffEnabled ? 'Enabling' : 'Disabling'} global Friends & Family feature`
  )

  const supabase = getAdminClient()

  try {
    // Upsert the config value
    const { error } = await supabase
      .from('referral_config')
      .upsert({ key: 'ff_enabled', value: ffEnabled }, { onConflict: 'key' })

    if (error) {
      console.error('Error updating config:', error.message)
      process.exit(1)
    }

    console.log(
      `\nFriends & Family feature is now ${ffEnabled ? 'ENABLED' : 'DISABLED'}`
    )

    // Show current F&F code count for context
    const { data: ffCodes, error: countError } = await supabase
      .from('referral_codes')
      .select('code, is_active')
      .eq('tier', 'friends_family')

    if (!countError && ffCodes) {
      const active = ffCodes.filter((c) => c.is_active).length
      const inactive = ffCodes.length - active
      console.log(
        `  Total F&F codes: ${ffCodes.length} (${active} active, ${inactive} inactive)`
      )
      if (!ffEnabled && active > 0) {
        console.log(
          `  Note: ${active} active codes will be blocked until F&F is re-enabled`
        )
      }
    }
  } catch (error) {
    console.error('Error toggling F&F:', error)
    process.exit(1)
  }
}

main()
