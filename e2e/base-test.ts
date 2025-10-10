import { test as base } from '@playwright/test'

/**
 * Base test with comprehensive diagnostic hooks and test isolation
 * All E2E tests should import from this file instead of @playwright/test
 *
 * This ensures every test gets:
 * - Analytics/telemetry route blocking (no external calls)
 * - Browser state isolation (storage, caches, service workers)
 * - Console logging (errors, warnings, diagnostics)
 * - Page error logging
 * - Network failure logging
 * - Test lifecycle logging
 */

// Block analytics and telemetry routes to prevent external calls and timeouts
const BLOCKED_ROUTES = [
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
  /analytics\.google\.com/i,
  /datadoghq/i,
  /sentry\.io/i,
  /hotjar/i,
  /segment\.com/i,
  /fullstory/i,
  /posthog/i,
]

// Configure clean storage state for each test
base.use({ storageState: { cookies: [], origins: [] } })

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // ============================================================================
    // Route Blocking - Block analytics and telemetry to prevent timeouts
    // ============================================================================
    await page.route(BLOCKED_ROUTES, (route) =>
      route.fulfill({ status: 204, body: '' })
    )

    // ============================================================================
    // Browser Isolation - Clear state before each test
    // ============================================================================
    await page.addInitScript(() => {
      // Clear caches
      if ('caches' in window) {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k)))
          .catch(() => {
            // Ignore errors
          })
      }
    })

    // ============================================================================
    // Console Logging - Capture all app logs
    // ============================================================================
    page.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()

      // Highlight important logs
      if (type === 'error') {
        console.error(`[console.error] ${text}`)
      } else if (type === 'warn') {
        console.warn(`[console.warn] ${text}`)
      } else if (text.includes('E2E_DIAG') || text.includes('OVERLAY')) {
        // Diagnostic logs are always important
        console.log(`[console.${type}] ${text}`)
      }
      // Suppress routine logs to avoid noise unless debugging
    })

    // ============================================================================
    // Page Error Logging - Capture uncaught exceptions
    // ============================================================================
    page.on('pageerror', (err) => {
      console.error(
        `[pageerror] ${err.message}${err.stack ? `\n${err.stack}` : ''}`
      )
    })

    // ============================================================================
    // Network Request Failures - Capture failed requests
    // ============================================================================
    page.on('requestfailed', (req) => {
      const failure = req.failure()
      console.warn(
        `[requestfailed] ${req.method()} ${req.url()} - ${failure?.errorText || 'unknown error'}`
      )
    })

    // ============================================================================
    // Service Worker Unregistration - Prevent request trapping
    // ============================================================================
    // Service Workers can intercept requests and cause timing issues in tests.
    // Unregister them before each test to ensure clean state.
    await page.addInitScript(() => {
      // Run as soon as page loads, before any SW can activate
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            registrations.forEach((registration) => {
              registration.unregister()
              console.log(
                '[SW] Unregistered service worker:',
                registration.scope
              )
            })
          })
          .catch((err) => {
            console.warn('[SW] Failed to unregister:', err)
          })
      }
    })

    console.log(`[TEST] Starting: ${testInfo.title}`)

    // Run the test
    await use(page)

    // After test completion
    const status = testInfo.status
    const duration = testInfo.duration

    if (status === 'failed') {
      console.error(`[TEST] ❌ ${testInfo.title} FAILED after ${duration}ms`)
    } else if (status === 'timedOut') {
      console.error(
        `[TEST] ⏱️  ${testInfo.title} TIMED OUT after ${duration}ms`
      )
    } else {
      console.log(`[TEST] ✅ ${testInfo.title} passed in ${duration}ms`)
    }
  },
})

export { expect } from '@playwright/test'
export type { Page } from '@playwright/test'
