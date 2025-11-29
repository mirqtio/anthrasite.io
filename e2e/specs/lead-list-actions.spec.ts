import { test, expect } from '@playwright/test'

// Skip in CI - requires auth and seeded test data
test.skip(!!process.env.CI, 'Skipping admin tests in CI - requires auth setup')

test('Lead List Delete Flow', async ({ page }) => {
  // 1. Go to leads page
  await page.goto('/admin/leads')
  await page.waitForSelector('table')

  // 2. Select the first lead
  const firstCheckbox = page.locator(
    'table tbody tr:first-child input[type="checkbox"]'
  )
  await firstCheckbox.check()

  // 3. Wait for Batch Action Bar
  const batchBar = page.locator('div.fixed.bottom-6')
  await expect(batchBar).toBeVisible()

  // 4. Click the actions menu button in the batch bar
  const actionsButton = batchBar.locator('button:has-text("Actions")')
  await actionsButton.click()

  // 5. Click "Delete Lead(s)" in the dropdown
  const deleteOption = page.locator('button:has-text("Delete Lead(s)")')
  await expect(deleteOption).toBeVisible()
  await deleteOption.click({ force: true })

  // 6. Verify Modal appears
  const modal = page.locator('div:has-text("Delete 1 Lead?")').last()
  await expect(modal).toBeVisible()

  // 7. Take screenshot
  await page.screenshot({ path: 'artifacts/list_delete_modal_verify.png' })

  // 8. Click Cancel
  await page.click('button:has-text("Cancel")')
  await expect(modal).not.toBeVisible()
})
