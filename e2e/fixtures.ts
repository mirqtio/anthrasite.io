import { test as base } from '@playwright/test'

/**
 * Extended test fixture with pre-accepted consent
 * Consent-specific tests can clear storage to test banner behavior
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Pre-accept consent before each test
    await page.addInitScript(() => {
      // Set consent in localStorage
      const consent = {
        version: 1,
        preferences: {
          analytics: true,
          marketing: true,
          performance: true,
          functional: true,
          timestamp: new Date().toISOString(),
        },
      }
      localStorage.setItem('anthrasite_cookie_consent', JSON.stringify(consent))

      // Set consent cookie
      document.cookie = `anthrasite_consent=accepted; path=/; max-age=31536000; SameSite=Lax`
    })

    await use(page)
  },
})

export { expect } from '@playwright/test'
