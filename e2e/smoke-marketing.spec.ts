import { test, expect } from '@playwright/test'

/**
 * Marketing smoke test for G1 codebase cleanup validation
 * Runtime target: <15s
 * Tests public site: homepage loads → hero renders → nav present
 */

test.describe('Marketing Smoke Test @smoke', () => {
  test('homepage marketing surface', async ({ page }) => {
    // 1. Homepage loads
    await page.goto('/')
    await expect(page).toHaveURL('/')
    await page.waitForLoadState('domcontentloaded')

    // 2. Hero visible (use data-testid for robustness)
    // Fallback to text if testid not present
    const heroTitle = page.getByTestId('hero-title')
    const hasTitleTestId = await heroTitle.count()

    if (hasTitleTestId > 0) {
      await expect(heroTitle).toBeVisible({ timeout: 10000 })
    } else {
      // Fallback: check for tagline text
      await expect(page.getByText('VALUE, CRYSTALLIZED')).toBeVisible({
        timeout: 10000,
      })
    }

    // 3. Footer/navigation present
    const nav = page.getByRole('navigation')
    await expect(nav).toBeVisible()
  })
})
