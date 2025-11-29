import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables from .env
dotenv.config()

import { getAdminClient } from '../lib/supabase/admin'

async function createAdminUser() {
  const email = process.argv[2] || 'admin@anthrasite.io'
  const password = process.argv[3] || 'password123'

  console.log('URL:', process.env.SUPABASE_URL)

  const supabase = getAdminClient()

  console.log(`Creating user: ${email}`)

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  })

  if (error) {
    console.error('Error creating user:', error.message)
    process.exit(1)
  }

  console.log('User created successfully:', data.user?.id)
}

createAdminUser()
