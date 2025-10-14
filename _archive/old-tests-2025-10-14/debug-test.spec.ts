import { test, expect } from '@playwright/test'

test('debug homepage loading', async ({ page }) => {
  // Capture console logs and errors
  const consoleMessages: string[] = []
  const errors: string[] = []

  page.on('console', (msg) => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`)
  })

  page.on('pageerror', (error) => {
    errors.push(error.message)
  })

  await page.goto('/')
  await page.waitForTimeout(5000) // Wait 5 seconds

  // Get page content
  const htmlContent = await page.content()
  const bodyText = await page.evaluate(() => document.body.innerText)

  // Check what elements are actually present
  const hasLoadingSpinner = await page.locator('.animate-pulse').count()
  const hasOrganicHomepage = await page
    .locator('[data-testid="organic-homepage"]')
    .count()
  const hasPurchaseHeader = await page
    .locator('[data-testid="purchase-header"]')
    .count()

  console.log('Console messages:', consoleMessages)
  console.log('Errors:', errors)
  console.log('Body text:', bodyText)
  console.log('Has loading spinner:', hasLoadingSpinner)
  console.log('Has organic homepage:', hasOrganicHomepage)
  console.log('Has purchase header:', hasPurchaseHeader)

  // Take a screenshot
  await page.screenshot({ path: 'debug-homepage.png', fullPage: true })

  // The test should pass regardless to show debug info
  expect(true).toBe(true)
})
