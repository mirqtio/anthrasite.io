import { test, expect } from '@playwright/test'

test.describe('Client-Side Rendering', () => {
  test('should properly hydrate React on client side', async ({ page }) => {
    // Navigate to the page
    await page.goto('/')
    
    // Check that React root exists
    const hasReactRoot = await page.evaluate(() => {
      return document.querySelector('#__next') !== null || 
             document.querySelector('[data-reactroot]') !== null
    })
    expect(hasReactRoot).toBe(true)
    
    // Check that React is defined in window
    const reactVersion = await page.evaluate(() => {
      return (window as any).React?.version || null
    })
    expect(reactVersion).toBeTruthy()
  })

  test('should not show loading state indefinitely', async ({ page }) => {
    await page.goto('/')
    
    // Wait up to 5 seconds for loading to complete
    await page.waitForFunction(
      () => !document.body.textContent?.includes('Loading...'),
      { timeout: 5000 }
    ).catch(() => {
      // If it times out, we want the test to fail
    })
    
    // Verify loading text is not present
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('Loading...')
  })

  test('should handle client-side navigation', async ({ page }) => {
    await page.goto('/')
    
    // Find and click a client-side link
    const learnMoreButton = page.locator('a:has-text("Learn more")')
    await expect(learnMoreButton).toBeVisible()
    
    // Click should trigger smooth scroll, not page reload
    await learnMoreButton.click()
    
    // Verify we're still on the same page (URL hasn't changed to a new page)
    expect(page.url()).toContain('/#')
  })

  test('should have interactive elements after hydration', async ({ page }) => {
    await page.goto('/')
    
    // Wait for content to load
    await page.waitForSelector('main', { state: 'visible' })
    
    // Check that buttons are clickable
    const joinWaitlistButton = page.locator('button:has-text("Join Waitlist")').first()
    await expect(joinWaitlistButton).toBeVisible()
    await expect(joinWaitlistButton).toBeEnabled()
    
    // Click the button and verify it responds
    await joinWaitlistButton.click()
    
    // Should scroll to waitlist form
    const waitlistForm = page.locator('#waitlist')
    await expect(waitlistForm).toBeInViewport()
  })

  test('should detect console errors', async ({ page }) => {
    const consoleErrors: string[] = []
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Listen for page errors
    page.on('pageerror', error => {
      consoleErrors.push(error.message)
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('Failed to load resource') &&
      !error.includes('Analytics not initialized') &&
      !error.includes('Datadog RUM not initialized')
    )
    
    // Should have no critical console errors
    expect(criticalErrors).toHaveLength(0)
  })

  test('should maintain state during client-side interactions', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('main', { state: 'visible' })
    
    // Type in the waitlist form
    const domainInput = page.locator('input[placeholder="example.com"]')
    await domainInput.fill('test.com')
    
    // Verify the input maintains its value
    await expect(domainInput).toHaveValue('test.com')
    
    // Click elsewhere on the page
    await page.locator('h1').click()
    
    // Input should still have its value
    await expect(domainInput).toHaveValue('test.com')
  })

  test('should handle hydration mismatches gracefully', async ({ page }) => {
    const hydrationErrors: string[] = []
    
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('Hydration') || text.includes('did not match')) {
        hydrationErrors.push(text)
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should not have hydration mismatch errors
    expect(hydrationErrors).toHaveLength(0)
  })
})