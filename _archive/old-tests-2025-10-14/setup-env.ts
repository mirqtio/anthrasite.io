// Import MSW server to ensure it starts before tests
import '../tests/setup'

// Environment validation
const requiredEnvVars = [
  'DATABASE_URL',
  'CI_MOCK_STRIPE',
  'CI_MOCK_ANALYTICS',
  'CI_MOCK_SUPABASE'
]

beforeAll(() => {
  // Validate environment
  for (const env of requiredEnvVars) {
    if (!process.env[env]) {
      throw new Error(`Missing required env var: ${env}`)
    }
  }

  console.log('✅ E2E environment validated')
  console.log(`📱 Running on project: ${process.env.PW_PROJECT || 'default'}`)
})
