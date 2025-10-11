import { Page, Locator, expect } from '@playwright/test'
import { waitForAppReady } from '@/e2e/utils/waits'
import { acceptConsentIfPresent as acceptConsent } from '@/e2e/utils/consent'

/**
 * Safely open a modal by clicking trigger and waiting for modal to appear
 * Handles animation timing and ensures modal is actually visible
 *
 * @param page - Playwright page object
 * @param trigger - Element that opens the modal when clicked
 * @param modal - The modal element that should appear
 */
export async function openModal(page: Page, trigger: Locator, modal: Locator) {
  // Click the trigger
  await trigger.click()

  // Wait for modal to be visible (handles animations)
  await expect(modal).toBeVisible({ timeout: 5000 })

  // Additional stability wait for animations to complete
  await page.waitForTimeout(300)
}

/**
 * Accept consent banner if present (re-export hardened implementation)
 * @deprecated Use acceptConsent from '@/e2e/utils/consent' directly
 */
export const acceptConsentIfPresent = acceptConsent

/**
 * Navigate to URL with stable page load waits
 * Uses networkidle to prevent chunk loading races
 * Assumes consent is pre-accepted via storageState in CI
 *
 * @param page - Playwright page object
 * @param url - URL to navigate to
 */
export async function gotoStable(page: Page, url: string) {
  // Wait for all network requests to settle (prevents chunk loading races)
  await page.goto(url, { waitUntil: 'networkidle' })

  // Verify hydration by checking body is visible
  await expect(page.locator('body').first()).toBeVisible({ timeout: 10_000 })

  // Wait for app to be fully ready
  await waitForAppReady(page)
}

/**
 * Navigate to URL and dismiss consent modal if present
 * Ensures clean storage state before navigation to prevent test pollution
 * Waits for React hydration to complete before proceeding
 *
 * Uses composite readiness detection to handle slow hydration gracefully.
 *
 * NOTE: In CI with storageState, consent is pre-accepted and this clears it.
 * Consider using gotoStable() instead for better performance.
 *
 * @param page - Playwright page object
 * @param url - URL to navigate to
 */
export async function gotoAndDismissConsent(page: Page, url: string) {
  // Clear cookies first (available before navigation)
  await page.context().clearCookies()

  // Navigate to page with networkidle wait (localStorage only accessible after navigation)
  await page.goto(url, { waitUntil: 'networkidle' })

  // Clear storage after page loads
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  // Wait for app to be fully ready (composite signal - rAF + idle + network)
  await waitForAppReady(page)

  await acceptConsentIfPresent(page)
}

/**
 * Wait for element to be stable (not moving due to animations)
 * Useful before clicking elements that might be animating
 *
 * @param locator - Element to wait for
 * @param timeout - Maximum time to wait (default: 5000ms)
 */
export async function waitForStable(locator: Locator, timeout = 5000) {
  await expect(locator).toBeVisible({ timeout })

  // Wait a bit for any animations to settle
  await locator.page().waitForTimeout(200)

  // Ensure element is in a stable state
  await expect(locator).toBeVisible()
}

// ============================================================================
// Compatibility exports for existing test signatures
// ============================================================================

/**
 * Alias for backward compatibility with existing tests
 */
export { gotoAndDismissConsent as gotoAndDismissCookies }

/**
 * Recommended navigation for CI - uses storageState pre-accepted consent
 */
export { gotoStable }

/**
 * Click element with animation handling (page-based signature)
 * Waits for element to be visible before clicking
 */
type ClickOpts = { waitForAnimations?: boolean; timeout?: number }

export async function safeClick(
  page: Page,
  selector: string,
  opts: ClickOpts = {}
) {
  const { waitForAnimations = true, timeout = 10_000 } = opts
  const loc = page.locator(selector)
  await expect(loc).toBeVisible({ timeout })
  if (waitForAnimations) {
    await page.addStyleTag({
      content: '*{transition:none!important;animation:none!important}',
    })
  }
  await loc.click()
}

/**
 * Fill input field (page-based signature)
 * Waits for element to be visible before filling
 */
export async function safeFill(
  page: Page,
  selector: string,
  value: string,
  timeout = 10_000
) {
  const loc = page.locator(selector)
  await expect(loc).toBeVisible({ timeout })
  await loc.fill(value)
}
