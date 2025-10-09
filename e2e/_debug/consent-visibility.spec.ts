import { test, expect } from '@playwright/test'
import { openCookiePreferences } from '../helpers/test-utils'
import { debugElementVisibility } from './visibility-debug'

test.describe('Consent Modal Visibility Debug', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    await page.waitForTimeout(1000)
  })

  test('debug modal visibility with computed styles', async ({ page }) => {
    console.log('\n=== Starting consent modal visibility debug ===\n')

    // Disable animations globally first
    await page.addStyleTag({
      content: `* { transition: none !important; animation: none !important; }`,
    })

    await openCookiePreferences(page)

    // Debug the flex wrapper
    const flexWrapper = page.locator('.fixed.inset-0.z-50.flex').first()
    await debugElementVisibility(page, flexWrapper, 'Flex Wrapper')

    // Debug the modal container
    const modalContainer = page
      .locator('[role="dialog"][aria-modal="true"]')
      .first()
    await debugElementVisibility(page, modalContainer, 'Modal Container')

    // Debug the title element
    const title = page.getByTestId('cookie-preferences-title')
    await debugElementVisibility(page, title, 'Modal Title')

    // Try to get visibility state from Playwright's perspective
    const isVisible = await title.isVisible().catch(() => false)
    const isHidden = await title.isHidden().catch(() => false)
    console.log(`\nPlaywright visibility check:`)
    console.log(`  isVisible(): ${isVisible}`)
    console.log(`  isHidden(): ${isHidden}`)

    // Check parent chain
    const parent = title.locator('..')
    await debugElementVisibility(page, parent, 'Title Parent')

    // Take a screenshot for visual confirmation
    await page.screenshot({
      path: 'test-results/consent-visibility-debug.png',
      fullPage: true,
    })

    console.log('\n=== Debug complete ===\n')

    // This assertion will likely fail, but we now have debug output
    await expect(title).toBeVisible({ timeout: 1000 })
  })
})
