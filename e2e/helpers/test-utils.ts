import { Page } from '@playwright/test'

/**
 * Helper to dismiss cookie consent banner in E2E tests
 * This prevents the cookie banner from blocking interactions with page elements
 */
export async function dismissCookieConsent(page: Page) {
  try {
    // Wait for cookie consent banner to appear and dismiss it
    const acceptButton = page.locator(
      'button:has-text("Accept all"), button[aria-label="Accept all cookies"]'
    )
    await acceptButton.first().click({ timeout: 3000 })
    await page.waitForTimeout(500) // Wait for banner to disappear
  } catch (error) {
    // Cookie banner might not appear or already dismissed - this is normal
  }
}

/**
 * Helper to navigate to a page and dismiss cookie consent
 */
export async function gotoAndDismissCookies(page: Page, url: string = '/') {
  await page.goto(url)
  await page.waitForLoadState('networkidle')
  await dismissCookieConsent(page)
}

/**
 * Helper to click an element after ensuring cookie consent is dismissed
 */
export async function clickAfterCookieDismissal(page: Page, selector: string) {
  await dismissCookieConsent(page)
  await page.locator(selector).first().click()
}
