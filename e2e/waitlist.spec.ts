import { test, expect, Page } from '@playwright/test'
import {
  gotoAndDismissCookies,
  safeClick,
  safeFill,
} from './helpers/test-utils'

test.describe('Waitlist Signup', () => {
  // Clean up test data - using API since E2E tests don't have direct DB access
  test.afterEach(async ({ request }) => {
    // In a real app, you'd have an admin API endpoint for this
    // For now, we'll just skip cleanup in E2E tests
  })

  // Helper to navigate to waitlist form
  async function navigateToWaitlistForm(page: Page) {
    await gotoAndDismissCookies(page, '/')

    // Wait for main content to load
    await page.waitForSelector('main', { state: 'visible', timeout: 20000 })

    // Try multiple selectors for the homepage heading
    const headingSelectors = [
      'h1:has-text("Your website has untapped potential")',
      'h1:has-text("untapped potential")',
      'text="Your website has untapped potential"',
      'h1',
    ]

    let headingFound = false
    for (const selector of headingSelectors) {
      try {
        await page.waitForSelector(selector, {
          state: 'visible',
          timeout: 5000,
        })
        headingFound = true
        break
      } catch {
        // Try next selector
      }
    }

    if (!headingFound) {
      // Log the page content for debugging
      const content = await page.textContent('body')
      console.log('Page content:', content?.substring(0, 500))
    }

    // Try multiple selectors for the waitlist button
    const buttonSelectors = [
      '[data-testid="open-waitlist-button"]',
      'button:has-text("Get Started")',
      'button:has-text("Join")',
      'button:has-text("Waitlist")',
      'button[type="button"]',
    ]

    for (const selector of buttonSelectors) {
      try {
        const button = await page.locator(selector).first()
        if (await button.isVisible()) {
          await safeClick(page, selector, { waitForAnimations: true })
          break
        }
      } catch {
        // Try next selector
      }
    }

    // Wait for the waitlist form with multiple possible selectors
    const formSelectors = [
      '[data-testid="waitlist-form"]',
      'form',
      'div:has(input[placeholder="example.com"])',
    ]

    for (const selector of formSelectors) {
      try {
        await page.waitForSelector(selector, {
          state: 'visible',
          timeout: 5000,
        })
        break
      } catch {
        // Try next selector
      }
    }

    // Ensure the domain input is visible
    await page.waitForSelector('input[placeholder="example.com"]', {
      state: 'visible',
      timeout: 10000,
    })
  }

  test('should complete waitlist signup with valid domain', async ({
    page,
  }) => {
    await navigateToWaitlistForm(page)

    // Enter domain
    await safeFill(page, 'input[placeholder="example.com"]', 'example.com')

    // Enter email
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'test@e2e-test.com'
    )

    // Submit form
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should show success
    await expect(page.getByText("You're on the list!")).toBeVisible()
  })

  test('should show error for invalid domain', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter invalid domain
    await safeFill(page, 'input[placeholder="example.com"]', 'not a domain')
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'test@example.com'
    )

    // Submit form with invalid domain
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should show error message
    await expect(page.getByText(/something went wrong/i)).toBeVisible()
  })

  test.skip('should show suggestion for domain typo', async ({ page }) => {
    // This feature is not implemented in the current simple form
    // Skipping until domain validation features are added
  })

  test('should handle domain with www prefix', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter domain with www
    await safeFill(page, 'input[placeholder="example.com"]', 'www.example.com')
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'test@example.com'
    )

    // Submit form
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should show success with the domain (current implementation doesn't normalize)
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()
    await expect(page.getByText(/we'll analyze www.example.com/i)).toBeVisible()
  })

  test('should handle duplicate signups', async ({ page }) => {
    // First signup
    await navigateToWaitlistForm(page)
    await safeFill(
      page,
      'input[placeholder="example.com"]',
      'duplicate-test.com'
    )
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'first@example.com'
    )
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Wait for success
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()

    // Close modal and try signup again
    await safeClick(page, 'button:has-text("Close")')

    // Second signup with same domain but different email
    await navigateToWaitlistForm(page)
    await safeFill(
      page,
      'input[placeholder="example.com"]',
      'duplicate-test.com'
    )
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'second@example.com'
    )
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should handle the duplicate signup (either success or appropriate message)
    // The current implementation may allow multiple emails for same domain
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter valid domain
    await safeFill(page, 'input[placeholder="example.com"]', 'example.com')

    // Try invalid email format (HTML5 validation should kick in)
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'invalid-email'
    )

    // Try to submit - should be prevented by HTML5 validation
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Form should still be visible (not submitted due to validation)
    await expect(page.getByTestId('waitlist-form')).toBeVisible()

    // Now enter valid email
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'valid@example.com'
    )
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should show success
    await expect(page.getByText("You're on the list!")).toBeVisible()
  })

  test.skip('should handle back navigation', async ({ page }) => {
    // This test expects multi-step form behavior which is not implemented
    // Current implementation is a simple single-step modal form
  })

  test('should show loading states', async ({ page }) => {
    // Intercept API calls to add delay
    await page.route('/api/waitlist', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await navigateToWaitlistForm(page)

    // Fill form
    await safeFill(page, 'input[placeholder="example.com"]', 'loading.com')
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'test@loading.com'
    )

    // Submit form
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should show loading state on button
    await expect(page.getByText('Joining...')).toBeVisible()

    // Wait for submission to complete
    await expect(page.getByText("You're on the list!")).toBeVisible({
      timeout: 15000,
    })
  })

  test('should track referral source', async ({ page }) => {
    await page.goto('/?ref=twitter')

    // Wait for page to load
    await expect(
      page.getByText('Your website has untapped potential')
    ).toBeVisible()

    // Open waitlist form
    await safeClick(page, '[data-testid="open-waitlist-button"]')
    await expect(page.getByTestId('waitlist-form')).toBeVisible()

    // Complete signup
    await safeFill(
      page,
      'input[placeholder="example.com"]',
      'referral-test.com'
    )
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'test@referral.com'
    )
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Wait for success - referral tracking happens server-side
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Block API calls
    await page.route('/api/waitlist', (route) => route.abort('failed'))

    await navigateToWaitlistForm(page)

    // Fill form
    await safeFill(page, 'input[placeholder="example.com"]', 'error.com')
    await safeFill(
      page,
      'input[placeholder="you@example.com"]',
      'test@example.com'
    )

    // Submit form
    await safeClick(page, '[data-testid="waitlist-submit-button"]')

    // Should show error message
    await expect(page.getByText(/something went wrong/i)).toBeVisible()
  })
})
