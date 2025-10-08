import { Page } from '@playwright/test'

/**
 * Navigate to a URL and automatically dismiss cookie consent banner
 */
export async function gotoAndDismissCookies(page: Page, url: string) {
  await page.goto(url)

  // Try to dismiss cookie banner if it exists
  try {
    const acceptButton = page.locator('button:has-text("Accept All")').first()
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click()
    }
  } catch {
    // Cookie banner not found or already dismissed - continue
  }
}

/**
 * Click an element with retries and animations handling
 */
export async function safeClick(
  page: Page,
  selector: string,
  options?: {
    waitForAnimations?: boolean
    timeout?: number
  }
) {
  const element = page.locator(selector).first()

  // Wait for element to be visible and enabled
  await element.waitFor({ state: 'visible', timeout: options?.timeout })

  // Wait for animations if requested
  if (options?.waitForAnimations) {
    await page.waitForTimeout(300)
  }

  // Scroll element into view
  await element.scrollIntoViewIfNeeded()

  // Click the element
  await element.click()
}

/**
 * Fill an input field with retries
 */
export async function safeFill(
  page: Page,
  selector: string,
  value: string,
  options?: {
    timeout?: number
  }
) {
  const element = page.locator(selector).first()

  // Wait for element to be visible and enabled
  await element.waitFor({ state: 'visible', timeout: options?.timeout })

  // Clear existing value
  await element.clear()

  // Fill with new value
  await element.fill(value)
}

/**
 * Open cookie preferences modal
 */
export async function openCookiePreferences(page: Page) {
  // Use testid for reliability
  const preferencesButton = page.getByTestId('cookie-preferences-button')

  await preferencesButton.waitFor({ state: 'visible', timeout: 5000 })
  await preferencesButton.click()

  // Wait for modal to appear
  await page.waitForTimeout(300)
}
