import { test } from '@playwright/test'
import {
  preparePageForScreenshot,
  compareScreenshots,
  VIEWPORTS,
  setupVisualTestContext,
} from './utils'
import {
  setupOrganicMode,
  setupPurchaseMode,
  setupConsentAccepted,
  resetState,
} from './fixtures/test-states'

test.beforeEach(async ({ page, context }) => {
  await setupVisualTestContext(context)
  await resetState(page)
  await setupConsentAccepted(page)
})

test.describe('Responsive Layout Visual Tests', () => {
  test.describe('Navigation Responsive', () => {
    Object.entries(VIEWPORTS).forEach(([name, viewport]) => {
      test(`navigation - ${name}`, async ({ page }) => {
        await page.setViewportSize(viewport)
        await setupOrganicMode(page)
        await preparePageForScreenshot(page)

        const nav = page.locator('nav, header')
        await compareScreenshots(nav, `responsive-nav-${name}.png`, {
          fullPage: false,
        })
      })
    })

    test('mobile menu open', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await setupOrganicMode(page)

      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]')
      await page.waitForSelector('[data-testid="mobile-menu"]', {
        state: 'visible',
      })

      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-mobile-menu-open.png')
    })
  })

  test.describe('Homepage Sections Responsive', () => {
    test('hero section - all viewports', async ({ page }) => {
      await setupOrganicMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const hero = page.locator('[data-testid="hero-section"]')
        await compareScreenshots(hero, `responsive-hero-${name}.png`, {
          fullPage: false,
        })
      }
    })

    test('features grid - all viewports', async ({ page }) => {
      await setupOrganicMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const features = page.locator('[data-testid="features-section"]')
        await compareScreenshots(features, `responsive-features-${name}.png`, {
          fullPage: false,
        })
      }
    })

    test('FAQ section - all viewports', async ({ page }) => {
      await setupOrganicMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const faq = page.locator('[data-testid="faq-section"]')
        await compareScreenshots(faq, `responsive-faq-${name}.png`, {
          fullPage: false,
        })
      }
    })
  })

  test.describe('Purchase Page Responsive', () => {
    test('pricing card - all viewports', async ({ page }) => {
      await setupPurchaseMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const pricing = page.locator('[data-testid="pricing-card"]')
        await compareScreenshots(pricing, `responsive-pricing-${name}.png`, {
          fullPage: false,
        })
      }
    })

    test('report preview - all viewports', async ({ page }) => {
      await setupPurchaseMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const preview = page.locator('[data-testid="report-preview"]')
        await compareScreenshots(preview, `responsive-preview-${name}.png`, {
          fullPage: false,
        })
      }
    })
  })

  test.describe('Forms Responsive', () => {
    test('waitlist form - all viewports', async ({ page }) => {
      await setupOrganicMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const form = page.locator('[data-testid="waitlist-form"]')
        await compareScreenshots(form, `responsive-waitlist-form-${name}.png`, {
          fullPage: false,
        })
      }
    })
  })

  test.describe('Footer Responsive', () => {
    test('footer - all viewports', async ({ page }) => {
      await setupOrganicMode(page)

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)

        // Scroll to footer
        await page.evaluate(() => {
          const footer = document.querySelector('footer')
          footer?.scrollIntoView()
        })

        await preparePageForScreenshot(page)

        const footer = page.locator('footer')
        await compareScreenshots(footer, `responsive-footer-${name}.png`, {
          fullPage: false,
        })
      }
    })
  })

  test.describe('Breakpoint Transitions', () => {
    test('mobile to tablet transition', async ({ page }) => {
      await setupOrganicMode(page)

      // Test at breakpoint boundaries
      const breakpoints = [
        { name: 'mobile-max', width: 639, height: 844 },
        { name: 'tablet-min', width: 640, height: 844 },
        { name: 'tablet-max', width: 767, height: 1024 },
        { name: 'desktop-min', width: 768, height: 1024 },
      ]

      for (const breakpoint of breakpoints) {
        await page.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height,
        })
        await preparePageForScreenshot(page)
        await compareScreenshots(
          page,
          `responsive-breakpoint-${breakpoint.name}.png`
        )
      }
    })
  })

  test.describe('Text Scaling', () => {
    test('typography responsive scaling', async ({ page }) => {
      await setupOrganicMode(page)

      // Create a test page with typography samples
      await page.evaluate(() => {
        const testContent = `
          <div style="padding: 40px; max-width: 800px; margin: 0 auto;">
            <h1>Heading 1 - Responsive Typography</h1>
            <h2>Heading 2 - Subheading Text</h2>
            <h3>Heading 3 - Section Title</h3>
            <p class="lead">Lead paragraph with larger text for emphasis.</p>
            <p>Regular paragraph text that should be readable across all device sizes.</p>
            <p class="small">Small text for secondary information.</p>
          </div>
        `
        document.querySelector('[data-testid="hero-section"]')!.innerHTML =
          testContent
      })

      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)

        const content = page.locator('[data-testid="hero-section"]')
        await compareScreenshots(content, `responsive-typography-${name}.png`, {
          fullPage: false,
        })
      }
    })
  })

  test.describe('Grid Layouts', () => {
    test('feature cards grid', async ({ page }) => {
      await setupOrganicMode(page)

      // Test different grid configurations
      const gridTests = [
        { width: 320, columns: 1 },
        { width: 640, columns: 2 },
        { width: 1024, columns: 3 },
        { width: 1440, columns: 4 },
      ]

      for (const { width, columns } of gridTests) {
        await page.setViewportSize({ width, height: 800 })
        await preparePageForScreenshot(page)

        const features = page.locator('[data-testid="features-section"]')
        await compareScreenshots(
          features,
          `responsive-grid-${columns}col.png`,
          {
            fullPage: false,
          }
        )
      }
    })
  })

  test.describe('Overflow Handling', () => {
    test('horizontal scroll prevention', async ({ page }) => {
      await setupOrganicMode(page)

      // Test narrow viewport
      await page.setViewportSize({ width: 320, height: 568 })

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        )
      })

      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-no-horizontal-scroll.png')

      // Assert no horizontal scroll
      if (hasHorizontalScroll) {
        throw new Error('Page has horizontal scroll at 320px width')
      }
    })

    test('long content handling', async ({ page }) => {
      await setupOrganicMode(page)

      // Add long content
      await page.evaluate(() => {
        const longText =
          'VeryLongWordWithoutBreaksToTestOverflowHandling'.repeat(5)
        const p = document.createElement('p')
        p.textContent = longText
        p.style.wordBreak = 'break-word'
        document.querySelector('[data-testid="hero-section"]')?.appendChild(p)
      })

      await page.setViewportSize(VIEWPORTS.mobile)
      await preparePageForScreenshot(page)

      const hero = page.locator('[data-testid="hero-section"]')
      await compareScreenshots(hero, 'responsive-long-content.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Touch Targets', () => {
    test('button sizes on mobile', async ({ page }) => {
      await setupOrganicMode(page)
      await page.setViewportSize(VIEWPORTS.mobile)

      // Verify minimum touch target sizes (44x44px)
      const buttons = await page.$$('button, a.btn')

      for (const button of buttons) {
        const box = await button.boundingBox()
        if (box && (box.width < 44 || box.height < 44)) {
          const text = await button.textContent()
          throw new Error(
            `Button "${text}" is smaller than minimum touch target size`
          )
        }
      }

      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-touch-targets.png')
    })
  })

  test.describe('Orientation Changes', () => {
    test('portrait vs landscape - mobile', async ({ page }) => {
      await setupOrganicMode(page)

      // Portrait
      await page.setViewportSize({ width: 390, height: 844 })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-mobile-portrait.png')

      // Landscape
      await page.setViewportSize({ width: 844, height: 390 })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-mobile-landscape.png')
    })

    test('portrait vs landscape - tablet', async ({ page }) => {
      await setupOrganicMode(page)

      // Portrait
      await page.setViewportSize({ width: 768, height: 1024 })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-tablet-portrait.png')

      // Landscape
      await page.setViewportSize({ width: 1024, height: 768 })
      await preparePageForScreenshot(page)
      await compareScreenshots(page, 'responsive-tablet-landscape.png')
    })
  })
})
