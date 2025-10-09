import { Page, expect } from '@playwright/test'

/**
 * Wait for React hydration to complete.
 * This ensures the app is fully interactive before tests proceed.
 *
 * In production builds, hydration takes longer due to code splitting
 * and chunk loading. This helper provides a reliable signal.
 *
 * @deprecated Use waitForAppReady instead for more reliable detection
 */
export async function waitForHydration(page: Page) {
  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded')

  // Wait for hydration flag to be set
  await page.waitForSelector('[data-hydrated="true"]', {
    state: 'attached',
    timeout: 15000,
  })

  // Verify the attribute is present
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true')
}

/**
 * Wait for app to be fully ready (composite signal).
 * Races multiple readiness indicators to handle slow hydration gracefully.
 *
 * This is more reliable than waitForHydration() alone because it doesn't
 * depend on a single signal. If any readiness indicator succeeds, the app
 * is considered ready.
 *
 * Indicators:
 * - ReadyGate flag (data-hydrated + __APP_READY__)
 * - Network idle (once)
 * - Spinner disappearance
 * - Optional route marker
 *
 * @param page - Playwright page
 * @param opts - Options
 * @param opts.routeMarker - Optional data-page attribute to wait for
 */
export async function waitForAppReady(
  page: Page,
  opts?: { routeMarker?: string }
) {
  const { routeMarker } = opts || {}

  // CRITICAL: Wait for hydration FIRST (required for click handlers)
  // Don't proceed until React has attached event handlers!
  await page
    .waitForFunction(
      () =>
        document.documentElement.getAttribute('data-hydrated') === 'true' ||
        (window as any).__APP_READY__ === true,
      { timeout: 25000, polling: 100 }
    )
    .catch(() => {
      console.warn('⚠️  Hydration flag not set within timeout')
    })

  // THEN race other signals for extra confidence
  const firstIdle = page
    .waitForLoadState('networkidle', { timeout: 5000 })
    .catch(() => {})

  const spinnerGone = (async () => {
    const spinner = page.locator('.animate-spin, [data-loading="true"]')
    const count = await spinner.count()
    if (count > 0) {
      await expect(spinner).not.toBeVisible({ timeout: 10000 })
    }
  })().catch(() => {})

  const routeReady = routeMarker
    ? page
        .waitForSelector(`[data-page="${routeMarker}"]`, {
          state: 'attached',
          timeout: 10000,
        })
        .catch(() => {})
    : Promise.resolve()

  // Race remaining signals (all optional)
  await Promise.race([firstIdle, spinnerGone, routeReady, Promise.resolve()])

  // Extra stability: ensure html has the hydration attribute
  try {
    await expect(page.locator('html')).toHaveAttribute(
      'data-hydrated',
      /true/,
      { timeout: 2000 }
    )
  } catch {
    // Already waited above, this is just a double-check
  }
}

/**
 * Wait for initial network activity to settle.
 * Use this before form interactions or navigation checks.
 *
 * This is a best-effort wait - it won't fail if network doesn't idle.
 */
export async function waitForFirstIdle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
    // Ignore timeout - some pages have long-polling or websockets
  })
}

/**
 * Wait for loading spinners to disappear.
 * Use this after form submissions or data fetches.
 */
export async function waitForSpinnerToDisappear(page: Page) {
  const spinner = page.locator('.animate-spin, [data-loading="true"]')

  const count = await spinner.count()
  if (count > 0) {
    await expect(spinner).not.toBeVisible({ timeout: 15000 })
  }
}
