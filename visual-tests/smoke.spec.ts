import { test, expect } from '@playwright/test'

test.describe('Smoke Visual Tests', () => {
  test('homepage - basic visual smoke test', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Basic screenshot comparison
    await expect(page).toHaveScreenshot('homepage-smoke-test.png')
  })
})