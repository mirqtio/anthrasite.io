import { Page, expect } from '@playwright/test'

/**
 * Accept consent banner if present (hardened with role-based selectors)
 * Never blocks - uses trial clicks and graceful fallbacks
 *
 * @param page - Playwright page object
 */
export async function acceptConsentIfPresent(page: Page) {
  const banner = page.getByRole('region', { name: /cookie consent/i })
  const bannerCount = await banner.count()

  if (bannerCount > 0) {
    // Prefer role-based button selector
    const btn = banner.getByRole('button', { name: /accept|agree/i })
    const btnCount = await btn.count()

    if (btnCount > 0) {
      // Trial click to verify it's clickable
      await btn.click({ trial: true }).catch(() => {})
      await btn.click()
    } else {
      // Fallback: any button in the region
      await banner.getByRole('button').first().click()
    }

    // Wait for banner to disappear (non-blocking)
    await expect(banner)
      .toBeHidden({ timeout: 5000 })
      .catch(() => {
        // Log but don't fail if banner doesn't disappear
        console.log('⚠️  Consent banner did not disappear within timeout')
      })
  }
}
