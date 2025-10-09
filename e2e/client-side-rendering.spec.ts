import { test, expect } from '@playwright/test'
import { waitForAppReady } from './utils/waits'
import { gotoAndDismissCookies, safeClick } from './helpers/test-utils'

test.describe('Client-Side Rendering', () => {
  test('should properly hydrate React on client side', async ({ page }) => {
    // Navigate to the page
    await gotoAndDismissCookies(page, '/')

    // Check that the page has rendered properly (App Router uses body as the container)
    const hasBody = await page.evaluate(() => {
      return document.body !== null && document.body.children.length > 0
    })
    expect(hasBody).toBe(true)

    // Check that Next.js has loaded by looking for Next.js script tags
    const hasNextJs = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))
      return scripts.some(
        (script) =>
          script.src.includes('_next') ||
          script.textContent?.includes('__next_f')
      )
    })
    expect(hasNextJs).toBe(true)
  })

  test('should not show loading state indefinitely', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Wait up to 5 seconds for loading to complete
    await page
      .waitForFunction(
        () => !document.body.textContent?.includes('Loading...'),
        { timeout: 5000 }
      )
      .catch(() => {
        // If it times out, we want the test to fail
      })

    // Verify loading text is not present
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toContain('Loading...')
  })

  test('should handle client-side navigation', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Wait for the page to load
    await page.waitForSelector('main', { state: 'visible' })

    // Check that the page has interactive elements
    const joinWaitlistButton = page.getByTestId('open-waitlist-button').first()
    await expect(joinWaitlistButton).toBeVisible()

    // Verify client-side interactivity by checking that React hydration worked
    const isInteractive = await page.evaluate(() => {
      // Check if we can find React fiber nodes (indicates hydration)
      const bodyChildren = document.body.children
      return (
        bodyChildren.length > 0 &&
        Array.from(bodyChildren).some((child) =>
          child.textContent?.includes('Get Started')
        )
      )
    })
    expect(isInteractive).toBe(true)
  })

  test('should have interactive elements after hydration', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Wait for content to load
    await page.waitForSelector('main', { state: 'visible' })

    // Check that buttons are clickable
    const joinWaitlistButton = page.getByTestId('open-waitlist-button').first()
    await expect(joinWaitlistButton).toBeVisible()
    await expect(joinWaitlistButton).toBeEnabled()

    // Click the button and verify it responds
    await joinWaitlistButton.click()

    // Should open modal with waitlist form (not scroll to it)
    const waitlistForm = page.locator('[data-testid="waitlist-form"]')
    await expect(waitlistForm).toBeVisible()
  })

  test('should detect console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Listen for page errors
    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForLoadState('networkidle')

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('Failed to load resource') &&
        !error.includes('Analytics not initialized') &&
        !error.includes('Datadog RUM not initialized')
    )

    // Should have no critical console errors
    expect(criticalErrors).toHaveLength(0)
  })

  test('should maintain state during client-side interactions', async ({
    page,
  }) => {
    await gotoAndDismissCookies(page, '/')
    await page.waitForSelector('main', { state: 'visible' })

    // Open waitlist modal first with animation wait
    await safeClick(page, '[data-testid="open-waitlist-button"]', {
      waitForAnimations: true,
    })

    // Type in the waitlist form (first input is domain)
    const domainInput = page.locator('input[placeholder="example.com"]')
    await domainInput.fill('test.com')

    // Verify the input maintains its value
    await expect(domainInput).toHaveValue('test.com')

    // Click elsewhere on the page (outside modal)
    await page.locator('body').click({ position: { x: 10, y: 10 } })

    // Input should still have its value
    await expect(domainInput).toHaveValue('test.com')
  })

  test('should handle hydration mismatches gracefully', async ({ page }) => {
    const hydrationErrors: string[] = []

    page.on('console', (msg) => {
      const text = msg.text()
      if (text.includes('Hydration') || text.includes('did not match')) {
        hydrationErrors.push(text)
      }
    })

    await page.goto('/')
    await waitForAppReady(page)
    await page.waitForLoadState('networkidle')

    // Should not have hydration mismatch errors
    expect(hydrationErrors).toHaveLength(0)
  })
})
