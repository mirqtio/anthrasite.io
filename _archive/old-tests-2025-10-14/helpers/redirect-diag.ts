/**
 * Redirect Diagnostics Helper
 *
 * Robust redirect assertion that captures response events instead of relying
 * on waitForNavigation() which often misses middleware redirects and SPA transitions.
 *
 * Added: 2025-10-13 to replace fragile waitForNavigation() pattern
 */

import { expect, Page } from '@playwright/test'

interface RedirectEvent {
  status: number
  url: string
  location?: string
}

interface AssertRedirectOptions {
  /** Expected HTTP status code (default: 307) */
  expectedStatus?: number
  /** Optional trigger function to execute before checking redirect */
  trigger?: () => Promise<void>
}

/**
 * Assert that a redirect occurred with the expected status and path
 *
 * This helper:
 * - Captures all HTTP redirect responses (3xx status codes)
 * - Records status codes and Location headers
 * - Provides diagnostic output on failure
 * - Performs defensive final URL check
 *
 * @param page - Playwright page object
 * @param expectedPath - Expected redirect target path (e.g., '/', '/link-expired')
 * @param opts - Options for status code and trigger function
 *
 * @example
 *   // Test redirect on bad UTM
 *   await assertRedirect(page, '/', {
 *     expectedStatus: 307,
 *     trigger: async () => { await page.goto('/purchase?utm=INVALID') }
 *   })
 *
 * @example
 *   // Test redirect after clicking a link
 *   await assertRedirect(page, '/about', {
 *     trigger: async () => { await page.click('a[href="/about"]') }
 *   })
 */
export async function assertRedirect(
  page: Page,
  expectedPath: string,
  opts: AssertRedirectOptions = {}
) {
  const expectedStatus = opts.expectedStatus ?? 307
  const events: RedirectEvent[] = []

  // Tap into all response events to capture redirects
  const responseHandler = (res: any) => {
    const status = res.status()
    const headers = res.headers()
    if (status >= 300 && status < 400) {
      events.push({
        status,
        url: res.url(),
        location: headers['location'] || headers['Location'],
      })
    }
  }

  page.on('response', responseHandler)

  try {
    // Execute trigger if provided (e.g., page.goto or click)
    if (opts.trigger) {
      await opts.trigger()
    }

    // Wait for navigation to settle
    await page.waitForLoadState('domcontentloaded').catch(() => {
      // Ignore timeout - we'll check events below
    })

    // Small settle time for any final network activity
    await page.waitForTimeout(50)

    // Find the redirect event that matches our expectations
    const hit = events.find(
      (e) =>
        e.status === expectedStatus && (e.location ?? '').includes(expectedPath)
    )

    // Assert redirect was found with diagnostic output on failure
    expect(
      hit,
      `Expected ${expectedStatus}→${expectedPath}, got events:\n${JSON.stringify(
        events,
        null,
        2
      )}`
    ).toBeTruthy()

    // Defensive check: verify we actually ended up at the expected path
    const escapedPath = expectedPath.replace(/\//g, '\\/')
    await page.waitForURL(new RegExp(escapedPath), { timeout: 5000 })
  } finally {
    // Clean up event listener
    page.off('response', responseHandler)
  }
}

/**
 * Assert that NO redirect occurred (e.g., request was allowed through)
 *
 * @param page - Playwright page object
 * @param trigger - Function to execute that should NOT cause a redirect
 *
 * @example
 *   await assertNoRedirect(page, async () => {
 *     await page.goto('/purchase?utm=VALID_TOKEN')
 *   })
 */
export async function assertNoRedirect(
  page: Page,
  trigger: () => Promise<void>
) {
  const events: RedirectEvent[] = []

  const responseHandler = (res: any) => {
    const status = res.status()
    if (status >= 300 && status < 400) {
      events.push({
        status,
        url: res.url(),
        location: res.headers()['location'] || res.headers()['Location'],
      })
    }
  }

  page.on('response', responseHandler)

  try {
    await trigger()
    await page.waitForLoadState('domcontentloaded').catch(() => {})
    await page.waitForTimeout(50)

    expect(
      events,
      `Expected no redirects, but got:\n${JSON.stringify(events, null, 2)}`
    ).toHaveLength(0)
  } finally {
    page.off('response', responseHandler)
  }
}
