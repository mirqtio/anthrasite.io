import { chromium } from '@playwright/test'
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

    // Prewarm server and verify environment
    console.log('🔥 Prewarming server and verifying environment...')
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()

    try {
      // Navigate to diagnostic route to:
      // - Warm up Next.js server (avoid cold start on first test)
      // - Verify environment configuration
      await page.goto('http://localhost:3333/e2e-diagnostics', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })

      // Capture and log environment for reference
      const envData = await page
        .locator('pre')
        .first()
        .textContent()
        .catch(() => 'unavailable')

      console.log(`\n📊 Test Environment Configuration:\n${envData}\n`)

      // Clear storage for clean state
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })

      console.log('✓ Server prewarmed successfully')
    } catch (error) {
      console.warn('⚠️  Server prewarm failed (tests may be slower):', error)
    } finally {
      await browser.close()
    }

    console.log('✓ Global setup complete\n')
  } catch (error) {
    console.error('✗ Global setup failed:', error)
    throw error
  }
}
