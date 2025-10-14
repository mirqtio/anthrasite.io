// tests/setup.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      // Only for tests; prod hosts ignore these anyway.
      extraHTTPHeaders: {
        'x-e2e-mode': 'purchase',
        'x-e2e-business-id': 'business-123',
      },
    })
    await use(context)
    await context.close()
  },
})

export const expect = test.expect
