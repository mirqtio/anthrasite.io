import type { Page, Locator } from '@playwright/test'

// Single entry-point for e2e helpers used by specs
// Re-export all utilities from _utils/ui
export * from '../_utils/ui'

// Explicitly export the new stable navigation function for CI
export { gotoStable } from '../_utils/ui'

/**
 * Opens the cookie preferences modal in a robust, E2E-safe way
 * Handles multiple fallback strategies for locating the trigger and dialog
 */
export async function openCookiePreferences(page: Page): Promise<Locator> {
  // 1) Prefer accessible locator (most stable)
  let trigger = page
    .getByRole('button', { name: /cookie (settings|preferences|consent)/i })
    .first()

  // Fallback to common test ids if present
  if ((await trigger.count()) === 0) {
    const candidates = [
      page.getByTestId('cookie-preferences-button'),
      page.getByTestId('open-consent'),
      page.getByTestId('open-cookie-preferences'),
      page.locator('[data-consent-open]'),
    ]
    for (const c of candidates) {
      if ((await c.count()) > 0) {
        trigger = c
        break
      }
    }
  }

  await trigger.click()

  // Resolve the dialog in a robust way
  const dialogCandidates: Locator[] = [
    page.getByRole('dialog', { name: /cookie preferences/i }),
    page.getByTestId('consent-modal-container'),
    page.locator('[role="dialog"][aria-modal="true"]'),
  ]

  for (const dialog of dialogCandidates) {
    try {
      await dialog.waitFor({ state: 'visible', timeout: 3000 })
      return dialog
    } catch {
      /* try the next candidate */
    }
  }

  // As a last resort, make animations inert to help visibility in CI
  await page.addStyleTag({
    content: `*{transition:none!important;animation:none!important}`,
  })

  const finalDialog = page.getByRole('dialog').first()
  await finalDialog.waitFor({ state: 'visible', timeout: 3000 })
  return finalDialog
}
