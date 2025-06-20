import { test } from '@playwright/test'
import {
  preparePageForScreenshot,
  compareScreenshots,
  setupVisualTestContext,
} from './utils'
import { setupOrganicMode, resetState } from './fixtures/test-states'

test.beforeEach(async ({ page, context }) => {
  await setupVisualTestContext(context)
  await resetState(page)
})

test.describe('Smoke Visual Tests', () => {
  test('homepage - basic visual regression', async ({ page }) => {
    await setupOrganicMode(page)
    await preparePageForScreenshot(page)
    await compareScreenshots(page, 'homepage-smoke-test.png')
  })
})