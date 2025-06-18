import { test } from '@playwright/test'
import {
  preparePageForScreenshot,
  compareScreenshots,
  testResponsiveViewports,
  setupVisualTestContext,
} from './utils'
import {
  setupExpiredUTM,
  setupUsedUTM,
  setupDarkMode,
  setupConsentAccepted,
  resetState,
} from './fixtures/test-states'
import { mockUTMParams } from './fixtures/mock-data'

test.beforeEach(async ({ page, context }) => {
  await setupVisualTestContext(context)
  await resetState(page)
  await setupConsentAccepted(page)
})

test.describe('Purchase Page Visual Tests', () => {
  test.describe('Valid UTM State', () => {
    test('full page screenshot', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-valid-full.png')
    })

    test('purchase hero', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const hero = page.locator('[data-testid="purchase-hero"]')
      await compareScreenshots(hero, 'purchase-valid-hero.png', {
        fullPage: false,
      })
    })

    test('pricing section', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const pricing = page.locator('[data-testid="pricing-section"]')
      await compareScreenshots(pricing, 'purchase-valid-pricing.png', {
        fullPage: false,
      })
    })

    test('report preview section', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const preview = page.locator('[data-testid="report-preview"]')
      await compareScreenshots(preview, 'purchase-valid-preview.png', {
        fullPage: false,
      })
    })

    test('trust signals section', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const trust = page.locator('[data-testid="trust-signals"]')
      await compareScreenshots(trust, 'purchase-valid-trust.png', {
        fullPage: false,
      })
    })

    test('dark mode', async ({ page }) => {
      await setupDarkMode(page)
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-valid-dark.png')
    })
  })

  test.describe('Error States', () => {
    test('expired UTM warning', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.expired)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const warning = page.locator('[data-testid="utm-warning"]')
      await compareScreenshots(warning, 'purchase-expired-warning.png', {
        fullPage: false,
      })
    })

    test('used UTM warning', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.used)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const warning = page.locator('[data-testid="utm-warning"]')
      await compareScreenshots(warning, 'purchase-used-warning.png', {
        fullPage: false,
      })
    })

    test('missing UTM parameters', async ({ page }) => {
      await page.goto('/purchase', { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-missing-utm.png')
    })

    test('invalid UTM parameters', async ({ page }) => {
      await page.goto('/purchase?utm_source=invalid', { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-invalid-utm.png')
    })
  })

  test.describe('Interactive States', () => {
    test('checkout button hover', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      // Hover over checkout button
      const checkoutButton = page.locator('[data-testid="checkout-button"]')
      await checkoutButton.hover()
      await page.waitForTimeout(100)
      
      await compareScreenshots(checkoutButton, 'purchase-checkout-hover.png', {
        fullPage: false,
      })
    })

    test('checkout button focus', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      // Focus checkout button
      const checkoutButton = page.locator('[data-testid="checkout-button"]')
      await checkoutButton.focus()
      
      await compareScreenshots(checkoutButton, 'purchase-checkout-focus.png', {
        fullPage: false,
      })
    })

    test('feature tooltip', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      
      // Hover over feature info icon
      const infoIcon = page.locator('[data-testid="feature-info-0"]').first()
      await infoIcon.hover()
      await page.waitForSelector('[role="tooltip"]', { state: 'visible' })
      
      await preparePageForScreenshot(page)
      
      const tooltip = page.locator('[role="tooltip"]')
      await compareScreenshots(tooltip, 'purchase-feature-tooltip.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Loading States', () => {
    test('checkout button loading', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      
      // Intercept checkout API to simulate loading
      await page.route('**/api/checkout-session', async (route) => {
        await page.waitForTimeout(5000)
        await route.continue()
      })
      
      // Click checkout button
      await page.click('[data-testid="checkout-button"]')
      await page.waitForTimeout(100) // Wait for loading state to appear
      
      await preparePageForScreenshot(page)
      
      const button = page.locator('[data-testid="checkout-button"]')
      await compareScreenshots(button, 'purchase-checkout-loading.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Responsive Layouts', () => {
    test('all viewports - valid UTM', async ({ page }) => {
      const params = new URLSearchParams(mockUTMParams.valid)
      
      await testResponsiveViewports(page, async (viewport) => {
        await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
        await preparePageForScreenshot(page)
        await compareScreenshots(page, `purchase-valid-${viewport}.png`)
      })
    })

    test('pricing card - mobile layout', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 })
      
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const pricing = page.locator('[data-testid="pricing-section"]')
      await compareScreenshots(pricing, 'purchase-pricing-mobile.png', {
        fullPage: false,
      })
    })

    test('report preview - tablet layout', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      const params = new URLSearchParams(mockUTMParams.valid)
      await page.goto(`/purchase?${params.toString()}`, { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      
      const preview = page.locator('[data-testid="report-preview"]')
      await compareScreenshots(preview, 'purchase-preview-tablet.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Success Page', () => {
    test('purchase success - full page', async ({ page }) => {
      await page.goto('/purchase/success?session_id=test_session_123', { 
        waitUntil: 'networkidle' 
      })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-success-full.png')
    })

    test('purchase success - dark mode', async ({ page }) => {
      await setupDarkMode(page)
      await page.goto('/purchase/success?session_id=test_session_123', { 
        waitUntil: 'networkidle' 
      })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-success-dark.png')
    })
  })

  test.describe('Cancel Page', () => {
    test('purchase cancel - full page', async ({ page }) => {
      await page.goto('/purchase/cancel', { waitUntil: 'networkidle' })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-cancel-full.png')
    })
  })

  test.describe('Recovery Page', () => {
    test('cart recovery - full page', async ({ page }) => {
      await page.goto('/purchase/recover?token=test_recovery_token', { 
        waitUntil: 'networkidle' 
      })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-recover-full.png')
    })

    test('cart recovery - invalid token', async ({ page }) => {
      await page.goto('/purchase/recover?token=invalid', { 
        waitUntil: 'networkidle' 
      })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'purchase-recover-invalid.png')
    })
  })
})