import { closeDb } from './db'

/**
 * Global teardown - runs once after all tests
 * Use for cleanup like closing database connections
 */
export default async function globalTeardown() {
  console.log('\n🧹 Running global teardown...')

  try {
    // Close database connection
    await closeDb()

    console.log('✓ Global teardown complete\n')
  } catch (error) {
    console.error('✗ Global teardown failed:', error)
    // Don't throw - allow tests to complete even if teardown fails
  }
}
