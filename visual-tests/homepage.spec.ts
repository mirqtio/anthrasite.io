import { test } from '@playwright/test'
import {
  preparePageForScreenshot,
  compareScreenshots,
  testResponsiveViewports,
  setupVisualTestContext,
} from './utils'
import {
  setupOrganicMode,
  setupPurchaseMode,
  setupDarkMode,
  setupConsentBanner,
  setupConsentAccepted,
  resetState,
} from './fixtures/test-states'

test.beforeEach(async ({ page, context }) => {
  await setupVisualTestContext(context)
  await resetState(page)
})

test.describe('Homepage Visual Tests', () => {
  test.describe('Organic Mode', () => {
    test('full page screenshot', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'homepage-organic-full.png')
    })

    test('hero section', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      const hero = page.locator('[data-testid="hero-section"]')
      await compareScreenshots(hero, 'homepage-organic-hero.png', {
        fullPage: false,
      })
    })

    test('waitlist form', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      const waitlistForm = page.locator('[data-testid="waitlist-form"]')
      await compareScreenshots(waitlistForm, 'homepage-organic-waitlist.png', {
        fullPage: false,
      })
    })

    test('features section', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      const features = page.locator('[data-testid="features-section"]')
      await compareScreenshots(features, 'homepage-organic-features.png', {
        fullPage: false,
      })
    })

    test('FAQ section', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      const faq = page.locator('[data-testid="faq-section"]')
      await compareScreenshots(faq, 'homepage-organic-faq.png', {
        fullPage: false,
      })
    })

    test('with consent banner', async ({ page }) => {
      await setupOrganicMode(page)
      await setupConsentBanner(page)
      await preparePageForScreenshot(page)

      await compareScreenshots(page, 'homepage-organic-consent-banner.png')
    })

    test('dark mode', async ({ page }) => {
      await setupOrganicMode(page)
      await setupDarkMode(page)
      await preparePageForScreenshot(page)

      await compareScreenshots(page, 'homepage-organic-dark.png')
    })
  })

  test.describe('Purchase Mode', () => {
    test('full page screenshot', async ({ page }) => {
      await setupPurchaseMode(page)
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'homepage-purchase-full.png')
    })

    test('purchase hero section', async ({ page }) => {
      await setupPurchaseMode(page)
      await preparePageForScreenshot(page)

      const hero = page.locator('[data-testid="purchase-hero"]')
      await compareScreenshots(hero, 'homepage-purchase-hero.png', {
        fullPage: false,
      })
    })

    test('pricing card', async ({ page }) => {
      await setupPurchaseMode(page)
      await preparePageForScreenshot(page)

      const pricing = page.locator('[data-testid="pricing-card"]')
      await compareScreenshots(pricing, 'homepage-purchase-pricing.png', {
        fullPage: false,
      })
    })

    test('report preview', async ({ page }) => {
      await setupPurchaseMode(page)
      await preparePageForScreenshot(page)

      const preview = page.locator('[data-testid="report-preview"]')
      await compareScreenshots(preview, 'homepage-purchase-preview.png', {
        fullPage: false,
      })
    })

    test('trust signals', async ({ page }) => {
      await setupPurchaseMode(page)
      await preparePageForScreenshot(page)

      const trust = page.locator('[data-testid="trust-signals"]')
      await compareScreenshots(trust, 'homepage-purchase-trust.png', {
        fullPage: false,
      })
    })

    test('dark mode', async ({ page }) => {
      await setupPurchaseMode(page)
      await setupDarkMode(page)
      await preparePageForScreenshot(page)

      await compareScreenshots(page, 'homepage-purchase-dark.png')
    })
  })

  test.describe('Responsive Layouts', () => {
    test('organic mode - all viewports', async ({ page }) => {
      await setupOrganicMode(page)
      await setupConsentAccepted(page)

      await testResponsiveViewports(page, async (viewport) => {
        await preparePageForScreenshot(page)
        await compareScreenshots(page, `homepage-organic-${viewport}.png`)
      })
    })

    test('purchase mode - all viewports', async ({ page }) => {
      await setupPurchaseMode(page)
      await setupConsentAccepted(page)

      await testResponsiveViewports(page, async (viewport) => {
        await preparePageForScreenshot(page)
        await compareScreenshots(page, `homepage-purchase-${viewport}.png`)
      })
    })
  })

  test.describe('Interactive States', () => {
    test('waitlist form - focused state', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      // Focus the email input
      await page.focus('[data-testid="waitlist-email-input"]')

      const form = page.locator('[data-testid="waitlist-form"]')
      await compareScreenshots(form, 'homepage-waitlist-focused.png', {
        fullPage: false,
      })
    })

    test('waitlist form - error state', async ({ page }) => {
      await setupOrganicMode(page)

      // Submit with invalid email
      await page.fill('[data-testid="waitlist-email-input"]', 'invalid-email')
      await page.click('[data-testid="waitlist-submit-button"]')

      // Wait for error message
      await page.waitForSelector('[data-testid="waitlist-error"]')
      await preparePageForScreenshot(page)

      const form = page.locator('[data-testid="waitlist-form"]')
      await compareScreenshots(form, 'homepage-waitlist-error.png', {
        fullPage: false,
      })
    })

    test('waitlist form - success state', async ({ page }) => {
      await setupOrganicMode(page)

      // Mock successful submission
      await page.route('**/api/waitlist', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        })
      })

      // Submit form
      await page.fill(
        '[data-testid="waitlist-email-input"]',
        'test@example.com'
      )
      await page.click('[data-testid="waitlist-submit-button"]')

      // Wait for success message
      await page.waitForSelector('[data-testid="waitlist-success"]')
      await preparePageForScreenshot(page)

      const form = page.locator('[data-testid="waitlist-form"]')
      await compareScreenshots(form, 'homepage-waitlist-success.png', {
        fullPage: false,
      })
    })

    test('FAQ item - expanded state', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      // Expand first FAQ item
      await page.click('[data-testid="faq-item-0"]')
      await page.waitForSelector('[data-testid="faq-answer-0"]', {
        state: 'visible',
      })

      await preparePageForScreenshot(page)

      const faq = page.locator('[data-testid="faq-section"]')
      await compareScreenshots(faq, 'homepage-faq-expanded.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Scroll States', () => {
    test('sticky header - scrolled state', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500))
      await page.waitForTimeout(100)

      const header = page.locator('header')
      await compareScreenshots(header, 'homepage-header-scrolled.png', {
        fullPage: false,
      })
    })

    test('scroll to top button - visible state', async ({ page }) => {
      await setupOrganicMode(page)

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForSelector('[data-testid="scroll-to-top"]', {
        state: 'visible',
      })

      await preparePageForScreenshot(page)

      await compareScreenshots(page, 'homepage-scroll-to-top.png', {
        clip: {
          x: window.innerWidth - 100,
          y: window.innerHeight - 100,
          width: 80,
          height: 80,
        },
      })
    })
  })
})
