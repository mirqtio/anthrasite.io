import { test, expect } from '@playwright/test'

// Skip in CI - requires auth and seeded test data
test.skip(!!process.env.CI, 'Skipping admin tests in CI - requires auth setup')

test.use({ viewport: { width: 1920, height: 1080 } })

test('Capture Modal Screenshots', async ({ page }) => {
  // 1. Details View Modal
  await page.goto('/admin/leads/1')

  // Dismiss cookie banner
  const cookieBanner = page.getByTestId('cookie-consent-banner')
  if (await cookieBanner.isVisible()) {
    await page.getByTestId('cookie-consent-accept').click()
  }

  await page.waitForSelector('h1')

  // Click Delete in Toolbar
  await page.getByText('Delete Lead').click({ force: true })
  await page.waitForTimeout(1000) // Wait for modal
  await page.screenshot({
    path: 'artifacts/repro_details_modal.png',
    fullPage: true,
  })

  // Close modal
  await page.getByText('Cancel').click({ force: true })

  // 2. List View Modal
  await page.goto('/admin/leads')
  await page.waitForSelector('table')

  // Select first lead
  await page
    .locator('table tbody tr:first-child input[type="checkbox"]')
    .check()

  // Click Actions in Batch Bar
  const batchBar = page.locator('div.fixed.bottom-6')
  await expect(batchBar).toBeVisible()
  await batchBar.locator('button:has-text("Actions")').click({ force: true })

  // Click Delete
  await page.locator('button:has-text("Delete Lead(s)")').click({ force: true })
  await page.waitForTimeout(1000)
  await page.screenshot({
    path: 'artifacts/repro_list_modal.png',
    fullPage: true,
  })
})
