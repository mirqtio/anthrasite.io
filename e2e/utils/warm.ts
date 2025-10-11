import { Page } from '@playwright/test'

/**
 * Warm Next.js chunks by triggering preload fetches
 * Helps stabilize module graph and prevents chunk loading races
 *
 * Use once after landing on a page with many lazy-loaded modules
 *
 * @example
 * await page.goto('/complex-page')
 * await warmNextChunks(page)
 */
export async function warmNextChunks(page: Page) {
  await page.evaluate(async () => {
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="modulepreload"],link[rel="preload"][as="script"]'
      )
    )
    await Promise.allSettled(
      links.map((l) => fetch(l.href).catch(() => {}))
    )
  })
}

/**
 * Wait for first network idle after client-side navigation
 * Use sparingly - only when a test asserts immediately after clicking a navigation link
 *
 * @example
 * await page.click('a[href="/about"]')
 * await waitForFirstIdle(page)
 * await expect(page.locator('h1')).toContainText('About')
 */
export async function waitForFirstIdle(page: Page) {
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
}
