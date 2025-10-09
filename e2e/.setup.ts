import { test } from '@playwright/test'

/**
 * Shared E2E Test Hooks with Comprehensive Diagnostics
 *
 * This file adds hooks to every test to:
 * - Log all console messages (helps debug hydration issues)
 * - Log page errors (uncaught exceptions)
 * - Log failed network requests
 * - Unregister Service Workers (prevent request trapping)
 * - Prewarm server on first navigation
 *
 * These hooks run before each test and capture data visible in CI logs.
 */

test.beforeEach(async ({ page }, testInfo) => {
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
            console.log('[SW] Unregistered service worker:', registration.scope)
          })
        })
        .catch((err) => {
          console.warn('[SW] Failed to unregister:', err)
        })
    }
  })

  console.log(`[TEST] Starting: ${testInfo.title}`)
})

// ============================================================================
// After Each Test - Cleanup and Logging
// ============================================================================
test.afterEach(async ({ page }, testInfo) => {
  // Log test result with timing
  const status = testInfo.status
  const duration = testInfo.duration

  if (status === 'failed') {
    console.error(`[TEST] ❌ ${testInfo.title} FAILED after ${duration}ms`)
  } else if (status === 'timedOut') {
    console.error(`[TEST] ⏱️  ${testInfo.title} TIMED OUT after ${duration}ms`)
  } else {
    console.log(`[TEST] ✅ ${testInfo.title} passed in ${duration}ms`)
  }
})
