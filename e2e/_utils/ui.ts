import { Page, Locator, expect } from '@playwright/test'

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
 * Accept consent modal if it appears
 * Safe to call even if modal doesn't appear (non-blocking)
 *
 * @param page - Playwright page object
 */
export async function acceptConsentIfPresent(page: Page) {
  try {
    // Look for consent modal with short timeout
    const consentModal = page.locator('[data-testid="consent-modal"]')
    const isVisible = await consentModal.isVisible({ timeout: 2000 }).catch(() => false)

    if (isVisible) {
      // Find and click accept button
      const acceptButton = consentModal.locator('button:has-text("Accept All")')
      await acceptButton.click({ timeout: 2000 })

      // Wait for modal to disappear
      await expect(consentModal).not.toBeVisible({ timeout: 3000 })

      console.log('✓ Consent modal accepted')
    }
  } catch (error) {
    // Silently ignore - consent modal is optional
    console.log('  (no consent modal found)')
  }
}

/**
 * Navigate to URL and dismiss consent modal if present
 * Convenience function combining navigation and consent handling
 *
 * @param page - Playwright page object
 * @param url - URL to navigate to
 */
export async function gotoAndDismissConsent(page: Page, url: string) {
  await page.goto(url)
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

/**
 * Click element with animation handling
 * Waits for element to be stable before clicking
 *
 * @param locator - Element to click
 */
export async function safeClick(locator: Locator) {
  await waitForStable(locator)
  await locator.click()
}
