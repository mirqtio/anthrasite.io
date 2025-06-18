import { test } from '@playwright/test'
import {
  preparePageForScreenshot,
  compareScreenshots,
  setupVisualTestContext,
  VIEWPORTS,
} from './utils'
import {
  setupOrganicMode,
  setupHelpWidgetOpen,
  setupDarkMode,
  resetState,
} from './fixtures/test-states'

test.beforeEach(async ({ page, context }) => {
  await setupVisualTestContext(context)
  await resetState(page)
})

test.describe('Help Widget Visual Tests', () => {
  test.describe('Widget Button States', () => {
    test('help button - default state', async ({ page }) => {
      await setupOrganicMode(page)
      await preparePageForScreenshot(page)
      
      const helpButton = page.locator('[data-testid="help-widget-trigger"]')
      await compareScreenshots(helpButton, 'help-widget-button-default.png', {
        fullPage: false,
      })
    })

    test('help button - hover state', async ({ page }) => {
      await setupOrganicMode(page)
      
      const helpButton = page.locator('[data-testid="help-widget-trigger"]')
      await helpButton.hover()
      await page.waitForTimeout(100)
      
      await preparePageForScreenshot(page)
      await compareScreenshots(helpButton, 'help-widget-button-hover.png', {
        fullPage: false,
      })
    })

    test('help button - focus state', async ({ page }) => {
      await setupOrganicMode(page)
      
      const helpButton = page.locator('[data-testid="help-widget-trigger"]')
      await helpButton.focus()
      
      await preparePageForScreenshot(page)
      await compareScreenshots(helpButton, 'help-widget-button-focus.png', {
        fullPage: false,
      })
    })

    test('help button - with notification badge', async ({ page }) => {
      await setupOrganicMode(page)
      
      // Add notification badge
      await page.evaluate(() => {
        const button = document.querySelector('[data-testid="help-widget-trigger"]')
        if (button) {
          const badge = document.createElement('span')
          badge.className = 'help-widget-badge'
          badge.textContent = '1'
          button.appendChild(badge)
        }
      })
      
      await preparePageForScreenshot(page)
      
      const helpButton = page.locator('[data-testid="help-widget-trigger"]')
      await compareScreenshots(helpButton, 'help-widget-button-badge.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Widget Panel States', () => {
    test('help panel - open state', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-panel-open.png', {
        fullPage: false,
      })
    })

    test('help panel - categories view', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Ensure we're on categories view
      const backButton = page.locator('[data-testid="help-back-button"]')
      if (await backButton.isVisible()) {
        await backButton.click()
      }
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-categories.png', {
        fullPage: false,
      })
    })

    test('help panel - FAQ list', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Click on a category
      await page.click('[data-testid="help-category-general"]')
      await page.waitForSelector('[data-testid="help-faq-list"]')
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-faq-list.png', {
        fullPage: false,
      })
    })

    test('help panel - FAQ answer expanded', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Navigate to FAQ and expand an answer
      await page.click('[data-testid="help-category-general"]')
      await page.waitForSelector('[data-testid="help-faq-list"]')
      await page.click('[data-testid="help-faq-item-0"]')
      await page.waitForSelector('[data-testid="help-faq-answer-0"]')
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-faq-expanded.png', {
        fullPage: false,
      })
    })

    test('help panel - search state', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Focus search input
      await page.fill('[data-testid="help-search-input"]', 'analytics')
      await page.waitForTimeout(300) // Wait for search results
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-search.png', {
        fullPage: false,
      })
    })

    test('help panel - no search results', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Search for something with no results
      await page.fill('[data-testid="help-search-input"]', 'xyzabc123')
      await page.waitForTimeout(300)
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-no-results.png', {
        fullPage: false,
      })
    })

    test('help panel - contact form', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Click contact support
      await page.click('[data-testid="help-contact-button"]')
      await page.waitForSelector('[data-testid="help-contact-form"]')
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-contact-form.png', {
        fullPage: false,
      })
    })

    test('help panel - contact form filled', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Navigate to contact form and fill it
      await page.click('[data-testid="help-contact-button"]')
      await page.waitForSelector('[data-testid="help-contact-form"]')
      
      await page.fill('[data-testid="contact-email"]', 'user@example.com')
      await page.fill('[data-testid="contact-subject"]', 'Need help with report')
      await page.fill('[data-testid="contact-message"]', 'I have a question about the analytics report...')
      
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-contact-filled.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Widget Dark Mode', () => {
    test('help widget - dark mode closed', async ({ page }) => {
      await setupOrganicMode(page)
      await setupDarkMode(page)
      await preparePageForScreenshot(page)
      
      const helpButton = page.locator('[data-testid="help-widget-trigger"]')
      await compareScreenshots(helpButton, 'help-widget-button-dark.png', {
        fullPage: false,
      })
    })

    test('help widget - dark mode open', async ({ page }) => {
      await setupOrganicMode(page)
      await setupDarkMode(page)
      await setupHelpWidgetOpen(page)
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-panel-dark.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Widget Responsive', () => {
    test('help widget - mobile viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.mobile)
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      await preparePageForScreenshot(page)
      
      await compareScreenshots(page, 'help-widget-mobile-open.png')
    })

    test('help widget - tablet viewport', async ({ page }) => {
      await page.setViewportSize(VIEWPORTS.tablet)
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      await preparePageForScreenshot(page)
      
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-tablet-open.png', {
        fullPage: false,
      })
    })

    test('help widget - position on different viewports', async ({ page }) => {
      await setupOrganicMode(page)
      
      for (const [name, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport)
        await preparePageForScreenshot(page)
        
        // Capture bottom-right corner where widget is positioned
        await compareScreenshots(page, `help-widget-position-${name}.png`, {
          clip: {
            x: viewport.width - 100,
            y: viewport.height - 100,
            width: 100,
            height: 100,
          },
        })
      }
    })
  })

  test.describe('Widget Animations', () => {
    test('help widget - opening animation', async ({ page }) => {
      await setupOrganicMode(page)
      
      // Click to start opening
      await page.click('[data-testid="help-widget-trigger"]')
      
      // Capture mid-animation (normally animations are disabled, but we can simulate)
      await page.waitForTimeout(50)
      
      await preparePageForScreenshot(page)
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-opening.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Widget Loading States', () => {
    test('help widget - loading FAQs', async ({ page }) => {
      await setupOrganicMode(page)
      
      // Intercept FAQ request to simulate loading
      await page.route('**/api/help/faqs', async (route) => {
        await page.waitForTimeout(2000)
        await route.continue()
      })
      
      await setupHelpWidgetOpen(page)
      await page.click('[data-testid="help-category-general"]')
      
      // Capture loading state
      await preparePageForScreenshot(page)
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-loading.png', {
        fullPage: false,
      })
    })

    test('help widget - contact form submitting', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Navigate to contact form
      await page.click('[data-testid="help-contact-button"]')
      await page.waitForSelector('[data-testid="help-contact-form"]')
      
      // Fill and submit form
      await page.fill('[data-testid="contact-email"]', 'user@example.com')
      await page.fill('[data-testid="contact-message"]', 'Test message')
      
      // Intercept submission to keep in loading state
      await page.route('**/api/help/contact', async (route) => {
        await page.waitForTimeout(5000)
        await route.continue()
      })
      
      await page.click('[data-testid="contact-submit"]')
      await page.waitForTimeout(100)
      
      await preparePageForScreenshot(page)
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-submitting.png', {
        fullPage: false,
      })
    })
  })

  test.describe('Widget Edge Cases', () => {
    test('help widget - very long FAQ answer', async ({ page }) => {
      await setupOrganicMode(page)
      await setupHelpWidgetOpen(page)
      
      // Mock a very long FAQ answer
      await page.evaluate(() => {
        const longAnswer = 'This is a very long answer. '.repeat(50)
        const faqData = {
          question: 'Test Question',
          answer: longAnswer,
        }
        // Inject into help widget data
        window.localStorage.setItem('help-test-faq', JSON.stringify(faqData))
      })
      
      await preparePageForScreenshot(page)
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-long-content.png', {
        fullPage: false,
      })
    })

    test('help widget - error state', async ({ page }) => {
      await setupOrganicMode(page)
      
      // Intercept API calls to simulate error
      await page.route('**/api/help/**', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      })
      
      await setupHelpWidgetOpen(page)
      await page.click('[data-testid="help-category-general"]')
      await page.waitForSelector('[data-testid="help-error-message"]')
      
      await preparePageForScreenshot(page)
      const helpPanel = page.locator('[data-testid="help-widget-content"]')
      await compareScreenshots(helpPanel, 'help-widget-error.png', {
        fullPage: false,
      })
    })
  })
})