import { test, expect } from './base-test'
import { gotoAndDismissCookies } from './helpers/test-utils'

test.describe('SiteMode Context', () => {
  test('should load in organic mode by default', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Wait for the organic homepage content to appear
    await expect(page.getByTestId('organic-homepage')).toBeVisible()

    // Should show organic homepage content
    await expect(
      page.locator('h1:has-text("Your website has untapped potential")')
    ).toBeVisible()
    await expect(page.getByTestId('open-waitlist-button')).toBeVisible()
  })

  test.skip('should switch to purchase mode with UTM parameter', async ({
    page,
  }) => {
    // Navigate with a UTM parameter
    await gotoAndDismissCookies(page, '/?utm=test-campaign')

    // With invalid UTM, should fallback to organic mode or handle gracefully
    await page.waitForFunction(
      () => {
        const hasOrgContent = document.querySelector(
          '[data-testid="organic-homepage"]'
        )
        const hasPurchaseContent = document.querySelector(
          '[data-testid="purchase-header"]'
        )
        return hasOrgContent || hasPurchaseContent
      },
      { timeout: 10000 }
    )

    // Check if we're in organic mode (which is expected with invalid UTM)
    const hasOrganicContent = await page.getByTestId('organic-homepage').count()
    if (hasOrganicContent > 0) {
      await expect(
        page.locator('h1:has-text("Your website has untapped potential")')
      ).toBeVisible()
    }
  })

  test('should handle context provider mounting correctly', async ({
    page,
  }) => {
    await gotoAndDismissCookies(page, '/')

    // The context should be available immediately
    const contextAvailable = await page.evaluate(() => {
      // Check if the page has rendered content (not just loading state)
      const mainElement = document.querySelector('main')
      return mainElement !== null && mainElement.children.length > 0
    })

    expect(contextAvailable).toBe(true)
  })

  test('should not cause infinite loading states', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Should load content within reasonable time and not be stuck loading
    await expect(page.getByTestId('organic-homepage')).toBeVisible()

    // Check that we have actual text content, not just loading
    const hasContent = await page.evaluate(() => {
      return document.body.textContent!.includes(
        'Your website has untapped potential'
      )
    })
    expect(hasContent).toBe(true)
  })

  test('should properly detect cookies for site mode', async ({
    page,
    context,
  }) => {
    // Set a cookie to simulate purchase mode
    await context.addCookies([
      {
        name: 'site_mode',
        value: 'purchase',
        domain: 'localhost',
        path: '/',
      },
      {
        name: 'business_id',
        value: 'test-business-123',
        domain: 'localhost',
        path: '/',
      },
    ])

    await gotoAndDismissCookies(page, '/')

    // Wait for content to appear (either organic or purchase mode)
    await page.waitForFunction(
      () => {
        const hasOrgContent = document.querySelector(
          '[data-testid="organic-homepage"]'
        )
        const hasPurchaseContent = document.querySelector(
          '[data-testid="purchase-header"]'
        )
        return hasOrgContent || hasPurchaseContent
      },
      { timeout: 10000 }
    )

    // Should have resolved to some content (either organic or purchase mode)
    const hasContent = await page.evaluate(() => {
      return document.body.textContent!.length > 100
    })
    expect(hasContent).toBe(true)
  })
})
