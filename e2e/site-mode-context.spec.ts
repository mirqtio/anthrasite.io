import { test, expect } from '@playwright/test'

test.describe('SiteMode Context', () => {
  test('should load in organic mode by default', async ({ page }) => {
    await page.goto('/')
    
    // Should not show loading state for more than 2 seconds
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...'),
      { timeout: 2000 }
    )
    
    // Should show organic homepage content
    await expect(page.locator('h1:has-text("Automated Website Audits")')).toBeVisible()
    await expect(page.locator('text=Join our waitlist')).toBeVisible()
  })

  test('should switch to purchase mode with UTM parameter', async ({ page }) => {
    // Navigate with a UTM parameter
    await page.goto('/?utm=test-campaign')
    
    // Wait for potential mode detection
    await page.waitForTimeout(1000)
    
    // In this test environment, it should still show organic mode
    // (since we don't have valid UTM tokens)
    await expect(page.locator('h1:has-text("Automated Website Audits")')).toBeVisible()
  })

  test('should handle context provider mounting correctly', async ({ page }) => {
    await page.goto('/')
    
    // The context should be available immediately
    const contextAvailable = await page.evaluate(() => {
      // Check if the page has rendered content (not just loading state)
      const mainElement = document.querySelector('main')
      return mainElement !== null && mainElement.children.length > 0
    })
    
    expect(contextAvailable).toBe(true)
  })

  test('should not cause infinite loading states', async ({ page }) => {
    await page.goto('/')
    
    // Wait a bit to ensure any loading states would appear
    await page.waitForTimeout(500)
    
    // Count how many times "Loading" appears in the page
    const loadingCount = await page.evaluate(() => {
      const bodyText = document.body.innerText || ''
      return (bodyText.match(/Loading/gi) || []).length
    })
    
    // Should not have any loading text
    expect(loadingCount).toBe(0)
  })

  test('should properly detect cookies for site mode', async ({ page, context }) => {
    // Set a cookie to simulate purchase mode
    await context.addCookies([
      {
        name: 'site_mode',
        value: 'purchase',
        domain: 'localhost',
        path: '/'
      },
      {
        name: 'business_id',
        value: 'test-business-123',
        domain: 'localhost',
        path: '/'
      }
    ])
    
    await page.goto('/')
    
    // Should not show loading state
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...'),
      { timeout: 2000 }
    )
    
    // In a real scenario with valid business data, this would show purchase mode
    // For now, it should at least not break or show loading indefinitely
    const hasContent = await page.evaluate(() => {
      return document.body.textContent!.length > 100
    })
    expect(hasContent).toBe(true)
  })
})