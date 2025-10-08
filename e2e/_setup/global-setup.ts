import { ensureDb } from './db'

/**
 * Global setup - runs once before all tests
 * Use for one-time initialization like database setup
 */
export default async function globalSetup() {
  console.log('\n🔧 Running global setup...')

  try {
    // Ensure database is accessible and schema is current
    await ensureDb()

    console.log('✓ Global setup complete\n')
  } catch (error) {
    console.error('✗ Global setup failed:', error)
    throw error
  }
}
