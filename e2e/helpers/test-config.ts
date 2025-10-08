/**
 * Test configuration helpers
 * Provides consistent access to test environment configuration
 */

/**
 * Get the base URL for E2E tests
 * Reads from process.env.BASE_URL or falls back to localhost:3333
 */
export function getTestBaseUrl(): string {
  return process.env.BASE_URL || 'http://localhost:3333'
}
