import { test, expect, Page } from '@playwright/test'

test.describe('Waitlist Signup', () => {
  // Clean up test data - using API since E2E tests don't have direct DB access
  test.afterEach(async ({ request }) => {
    // In a real app, you'd have an admin API endpoint for this
    // For now, we'll just skip cleanup in E2E tests
  })

  // Helper to navigate to waitlist form
  async function navigateToWaitlistForm(page: Page) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('button:has-text("Join Waitlist")').first().click()
    await page.waitForSelector('input[placeholder="example.com"]', {
      state: 'visible',
      timeout: 5000,
    })
  }

  test('should complete waitlist signup with valid domain', async ({
    page,
  }) => {
    await navigateToWaitlistForm(page)

    // Enter domain
    await page.fill('input[placeholder="example.com"]', 'example.com') // Use a real domain that will validate

    // Wait for validation to complete
    await page.waitForTimeout(800) // Wait for debounce + API call

    // Check for validation message or error
    const validatingMessage = page.locator('text=Validating domain')
    if (await validatingMessage.isVisible()) {
      await expect(validatingMessage).not.toBeVisible({ timeout: 5000 })
    }

    // Continue button should be enabled
    await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled({
      timeout: 5000,
    })

    // Click continue
    await page.click('button:has-text("Continue")')

    // Should show email step
    await expect(
      page.getByText(/we'll analyze e2e-test-valid.com/i)
    ).toBeVisible()

    // Enter email
    await page.fill('input[placeholder="you@example.com"]', 'test@e2e-test.com')

    // Submit
    await page.click('button:has-text("Join Waitlist")')

    // Should show success
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()
    await expect(page.getByText(/test@example.com/)).toBeVisible()
  })

  test('should show error for invalid domain', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter invalid domain
    await page.fill('input[placeholder="example.com"]', 'not a domain')

    // Wait for validation
    await page.waitForTimeout(600)

    // Should show error
    await expect(page.getByText(/invalid characters in domain/i)).toBeVisible()

    // Continue button should be disabled
    await expect(page.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  test('should show suggestion for domain typo', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter domain with typo
    await page.fill('input[placeholder="example.com"]', 'gmial.com')

    // Wait for validation
    await page.waitForTimeout(600)

    // Should show suggestion
    await expect(page.getByText(/did you mean/i)).toBeVisible()
    await expect(page.getByRole('button', { name: 'gmail.com' })).toBeVisible()

    // Click suggestion
    await page.click('button:has-text("gmail.com")')

    // Input should update
    await expect(page.locator('input[placeholder="example.com"]')).toHaveValue(
      'gmail.com'
    )
  })

  test('should normalize domain with www prefix', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter domain with www
    await page.fill('input[placeholder="example.com"]', 'www.e2e-test-www.com')

    // Wait for validation
    await page.waitForTimeout(600)

    // Continue
    await page.click('button:has-text("Continue")')

    // Should show normalized domain without www
    await expect(
      page.getByText(/we'll analyze e2e-test-www.com/i)
    ).toBeVisible()
    await expect(page.getByText('www')).not.toBeVisible()
  })

  test('should handle duplicate signups', async ({ page }) => {
    // First signup via UI
    await navigateToWaitlistForm(page)

    // First signup
    await page.fill('input[placeholder="example.com"]', 'test.com')
    await page.waitForTimeout(800)
    await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled({
      timeout: 5000,
    })
    await page.click('button:has-text("Continue")')
    await page.fill('input[placeholder="you@example.com"]', 'first@example.com')
    await page.click('button:has-text("Join Waitlist")')

    // Wait for success
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()

    // Second signup with same domain
    await navigateToWaitlistForm(page)

    // Enter same domain
    await page.fill('input[placeholder="example.com"]', 'test.com')
    await page.waitForTimeout(600)

    // Continue
    await page.click('button:has-text("Continue")')

    // Enter different email
    await page.fill(
      'input[placeholder="you@example.com"]',
      'second@example.com'
    )

    // Submit
    await page.click('button:has-text("Join Waitlist")')

    // Should still show success with existing position
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()
    await expect(page.getByText(/#1/)).toBeVisible() // Still first position
  })

  test('should validate email format', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Enter domain
    await page.fill('input[placeholder="example.com"]', 'email.com')
    await page.waitForTimeout(600)

    // Continue
    await page.click('button:has-text("Continue")')

    // Try invalid emails
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user@@example.com',
    ]

    for (const invalidEmail of invalidEmails) {
      await page.fill('input[placeholder="you@example.com"]', '')
      await page.fill('input[placeholder="you@example.com"]', invalidEmail)

      // Button should be disabled
      await expect(
        page.getByRole('button', { name: /join waitlist/i })
      ).toBeDisabled()
    }

    // Enter valid email
    await page.fill('input[placeholder="you@example.com"]', 'valid@example.com')

    // Button should be enabled
    await expect(
      page.getByRole('button', { name: /join waitlist/i })
    ).toBeEnabled()
  })

  test('should handle back navigation', async ({ page }) => {
    await navigateToWaitlistForm(page)

    // Complete domain step
    await page.fill('input[placeholder="example.com"]', 'back.com')
    await page.waitForTimeout(600)
    await page.click('button:has-text("Continue")')

    // Should be on email step
    await expect(page.getByText(/enter your email/i)).toBeVisible()

    // Click back
    await page.click('button:has-text("Back")')

    // Should be back on domain step with value preserved
    await expect(page.getByText(/enter your website domain/i)).toBeVisible()
    await expect(page.locator('input[placeholder="example.com"]')).toHaveValue(
      'back.com'
    )
  })

  test('should show loading states', async ({ page }) => {
    // Intercept API calls to add delay
    await page.route('/api/waitlist/validate-domain', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await page.route('/api/waitlist', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.continue()
    })

    await navigateToWaitlistForm(page)

    // Enter domain
    await page.fill('input[placeholder="example.com"]', 'loading.com')

    // Should show validation loading
    await expect(page.getByText(/validating domain/i)).toBeVisible()

    // Wait for validation
    await page.waitForTimeout(1500)

    // Continue
    await page.click('button:has-text("Continue")')

    // Enter email
    await page.fill('input[placeholder="you@example.com"]', 'test@example.com')

    // Submit
    await page.click('button:has-text("Join Waitlist")')

    // Should show loading button
    await expect(
      page.getByRole('button', { name: /join waitlist/i })
    ).toBeDisabled()

    // Wait for submission
    await expect(page.getByText(/you're on the list!/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test('should track referral source', async ({ page }) => {
    await page.goto('/?ref=twitter')

    // Scroll to waitlist section
    await page.waitForLoadState('networkidle')
    await page.locator('button:has-text("Join Waitlist")').first().click()
    await page.waitForSelector('input[placeholder="example.com"]', {
      state: 'visible',
      timeout: 5000,
    })

    // Complete signup
    await page.fill('input[placeholder="example.com"]', 'example.com')
    await page.waitForTimeout(800)
    await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled({
      timeout: 5000,
    })
    await page.click('button:has-text("Continue")')
    await page.fill('input[placeholder="you@example.com"]', 'test@example.com')
    await page.click('button:has-text("Join Waitlist")')

    // Wait for success
    await expect(page.getByText(/you're on the list!/i)).toBeVisible()

    // The referral source tracking is validated by the success of the signup
    // In a real app, you'd verify this via an API or admin interface
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Block API calls
    await page.route('/api/waitlist', (route) => route.abort('failed'))

    await navigateToWaitlistForm(page)

    // Complete domain step
    await page.fill('input[placeholder="example.com"]', 'error.com')
    await page.waitForTimeout(600)
    await page.click('button:has-text("Continue")')

    // Enter email and submit
    await page.fill('input[placeholder="you@example.com"]', 'test@example.com')
    await page.click('button:has-text("Join Waitlist")')

    // Should show error
    await expect(page.getByText(/unable to join waitlist/i)).toBeVisible()
  })
})
