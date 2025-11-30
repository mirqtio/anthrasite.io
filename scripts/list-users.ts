import * as dotenv from 'dotenv'
import { getAdminClient } from '../lib/supabase/admin'

// Load environment variables from .env
dotenv.config()

async function listUsers() {
  console.log('URL:', process.env.SUPABASE_URL)

  const supabase = getAdminClient()

  console.log(`Listing users...`)

  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error.message)
    process.exit(1)
  }

  if (users.length === 0) {
    console.log('No users found.')
    return
  }

  console.log('Found users:')
  users.forEach((u) => {
    console.log(
      `- ${u.email} (ID: ${u.id}) [Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}] [Last Sign In: ${u.last_sign_in_at || 'Never'}]`
    )
  })
}

listUsers()
