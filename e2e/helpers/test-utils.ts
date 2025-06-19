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
  await page.waitForLoadState('domcontentloaded')
  await dismissCookieConsent(page)
  await page.waitForTimeout(1000) // Give extra time for React hydration
}

/**
 * Helper to click an element after ensuring cookie consent is dismissed
 */
export async function clickAfterCookieDismissal(page: Page, selector: string) {
  await dismissCookieConsent(page)
  await page.locator(selector).first().click()
}

/**
 * Safely interact with an element by ensuring it's in viewport and stable
 */
export async function safeClick(
  page: Page,
  selector: string,
  options?: { timeout?: number }
) {
  const element = page.locator(selector)

  // Ensure element exists and is visible
  await element.waitFor({
    state: 'visible',
    timeout: options?.timeout || 10000,
  })

  // Scroll element into view
  await element.scrollIntoViewIfNeeded()

  // Wait for element to be stable
  await page.waitForTimeout(200)

  // Dismiss cookie consent if it might be blocking
  await dismissCookieConsent(page)

  // Click with force if needed
  try {
    await element.click({ timeout: 5000 })
  } catch (error) {
    // Retry with force if initial click fails
    await element.click({ force: true, timeout: 2000 })
  }
}

/**
 * Safely fill an input by ensuring it's interactive
 */
export async function safeFill(
  page: Page,
  selector: string,
  value: string,
  options?: { timeout?: number }
) {
  const element = page.locator(selector)

  // Ensure element exists and is enabled
  await element.waitFor({
    state: 'visible',
    timeout: options?.timeout || 10000,
  })

  // Scroll into view
  await element.scrollIntoViewIfNeeded()

  // Clear and fill
  await element.clear()
  await page.waitForTimeout(100)
  await element.fill(value)

  // Verify the value was set
  await page.waitForFunction(
    ({ selector, value }) => {
      const el = document.querySelector(selector) as HTMLInputElement
      return el && el.value === value
    },
    { selector, value },
    { timeout: 3000 }
  )
}
