import * as dotenv from 'dotenv'
import { getAdminClient } from '../lib/supabase/admin'

// Load environment variables from .env
dotenv.config()

async function deleteAdminUser() {
  const email = process.argv[2] || 'admin@anthrasite.io'

  console.log('URL:', process.env.SUPABASE_URL)

  const supabase = getAdminClient()

  console.log(`Looking for user: ${email}`)

  // List users to find the ID
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError.message)
    process.exit(1)
  }

  const user = users.find((u) => u.email === email)

  if (!user) {
    console.log(`User ${email} not found.`)
    return
  }

  console.log(`Found user ${email} with ID: ${user.id}`)
  console.log(`Deleting user...`)

  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('Error deleting user:', deleteError.message)
    process.exit(1)
  }

  console.log('User deleted successfully.')
}

deleteAdminUser()
