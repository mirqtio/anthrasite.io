import { test, expect } from '@playwright/test'

test('Lead Deletion Flow', async ({ page }) => {
  // 1. Go to a lead page (we need a valid ID, let's assume one exists or mock it)
  // Ideally we should create a lead first, but for now let's try to use an existing one or just check the UI on a known lead if possible.
  // Since we don't have a clean seed, let's try to find a lead from the list first.

  // 1. Go to lead detail page directly
  await page.goto('/admin/leads/1')

  // Wait for detail page content
  await page.waitForSelector('h1')

  // Dismiss consent banner if present
  const acceptCookies = page.getByTestId('accept-all-cookies-button')
  if (await acceptCookies.isVisible()) {
    await acceptCookies.click()
    await expect(page.getByTestId('consent-banner')).not.toBeVisible()
  }

  // 2. Click Delete button
  await page.click('button:has-text("Delete Lead")')

  // 3. Verify Modal appears (it should be in a Portal now, so look    // 3. Verify Modal appears
  const modal = page.locator('div:has-text("Delete 1 Lead?")').last()
  await expect(modal).toBeVisible()

  // Take a screenshot of the modal  // 4. Take screenshot
  await page.screenshot({ path: 'artifacts/delete_modal_css_verify.png' })

  // 4. Click Cancel
  await page.click('button:has-text("Cancel")')
  await expect(modal).not.toBeVisible()
})
