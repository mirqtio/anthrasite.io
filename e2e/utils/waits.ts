import { Page, expect } from '@playwright/test'

/**
 * Wait for React hydration to complete.
 * This ensures the app is fully interactive before tests proceed.
 *
 * In production builds, hydration takes longer due to code splitting
 * and chunk loading. This helper provides a reliable signal.
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
 * Wait for initial network activity to settle.
 * Use this before form interactions or navigation checks.
 *
 * This is a best-effort wait - it won't fail if network doesn't idle.
 */
export async function waitForFirstIdle(page: Page) {
  await page
    .waitForLoadState('networkidle', { timeout: 15000 })
    .catch(() => {
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
