import { test, expect } from '@playwright/test'

/**
 * Minimal smoke test for G1 codebase cleanup validation
 * Runtime target: <30s
 * Tests golden path: purchase page → payment UI → success page
 */

test.describe('Smoke Test @smoke', () => {
  test('purchase page golden path', async ({ page }) => {
    // Use dev UTM token with preview mode
    const utm = 'dev-utm-valid'

    // 1. Purchase page renders
    await page.goto(`/purchase?utm=${utm}&preview=true`)
    await page.waitForLoadState('domcontentloaded')

    // Verify page loaded with purchase header
    await expect(page.getByTestId('purchase-header')).toBeVisible({
      timeout: 10000,
    })

    // 2. Payment UI mounts (feature flag ON)
    // Check for checkout button which indicates payment UI is ready
    const checkoutButton = page.getByTestId('checkout-button')
    await expect(checkoutButton).toBeVisible()

    // 3. Navigate to success page stub
    // In mock mode, this redirects to checkout simulator
    await checkoutButton.click()
    await page.waitForURL(/\/test-purchase\/checkout-simulator/, {
      timeout: 5000,
    })

    // Verify we reached the checkout/success flow
    await expect(page).toHaveURL(/\/test-purchase\/checkout-simulator/)
  })
})
