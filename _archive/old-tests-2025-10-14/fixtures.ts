import { test as base } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Extended test fixture with pre-accepted consent and database cleanup
 * Consent-specific tests can clear storage to test banner behavior
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Pre-accept consent before each test
    await page.addInitScript(() => {
      // Set consent in localStorage
      const consent = {
        version: '1.0',
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

  // Database cleanup fixture
  dbCleanup: async ({}, use) => {
    // Clean before test
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Purchase" RESTART IDENTITY CASCADE')

    await use(undefined)

    // Clean after test
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "Purchase" RESTART IDENTITY CASCADE')
  },
})

export { expect } from '@playwright/test'
