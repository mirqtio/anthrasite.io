import { test, expect } from '@playwright/test'
import { generateUTMToken } from './helpers/utm-generator'
import { mockStripeCheckout } from './helpers/stripe-mocks'
import {
  safeClick,
  safeFill,
  gotoAndDismissCookies,
} from './helpers/test-utils'

test.describe('Full User Journey - Happy Paths', () => {
  test.describe('Organic Visitor Flow', () => {
    test('complete waitlist signup journey', async ({ page }) => {
      // 1. Visit homepage with cookie dismissal
      await gotoAndDismissCookies(page, '/')
      await expect(page).toHaveTitle(/Anthrasite/)

      // 2. Verify organic mode
      await expect(
        page.getByRole('heading', {
          name: /Your website has untapped potential/i,
        })
      ).toBeVisible()

      // 3. Click Get Started button to open modal with animation wait
      await safeClick(page, '[data-testid="open-waitlist-button"]', {
        waitForAnimations: true,
      })

      // 4. Fill waitlist form in modal
      await expect(page.getByTestId('waitlist-form')).toBeVisible()
      await safeFill(page, 'input[placeholder="example.com"]', 'example.com')
      await safeFill(
        page,
        'input[placeholder="you@company.com"]',
        'test@example.com'
      )

      // 5. Submit waitlist form
      await safeClick(page, '[data-testid="waitlist-submit-button"]')

      // 6. Verify success state
      await expect(page.getByText("You're on the list!")).toBeVisible()
      await expect(
        page.getByText(/We'll analyze .* and send the report when we launch/)
      ).toBeVisible()

      // 7. Check analytics event fired
      await page
        .evaluate(() => {
          return window.dataLayer?.some(
            (event) => event.event === 'waitlist_signup'
          )
        })
        .then((result) => expect(result).toBeTruthy())
    })
  })

  test.describe('Email → Purchase → Success Flow', () => {
    test('complete purchase journey with valid UTM', async ({ page }) => {
      // Generate valid UTM token
      const utm = await generateUTMToken({
        businessId: 'test-business-123',
        businessName: 'Test Company',
        domain: 'testcompany.com',
      })

      // 1. Visit with UTM parameter
      await page.goto(`/purchase?utm=${utm}`)

      // 2. Verify purchase mode
      await expect(
        page.getByText(/Test Company, your audit is ready/i)
      ).toBeVisible()

      // 3. Check pricing display
      await expect(page.getByText('$99')).toBeVisible()

      // 4. Verify trust signals
      await expect(page.getByText(/Secure payment/i)).toBeVisible()
      await expect(page.getByText(/24hr delivery/i)).toBeVisible()

      // 5. Mock Stripe checkout
      await mockStripeCheckout(page)

      // 6. Click purchase button
      const purchaseButton = page.getByRole('button', {
        name: /Get Your Report Now/i,
      })
      await purchaseButton.click()

      // 7. Verify loading state
      await expect(purchaseButton).toContainText('Processing...')

      // 8. Simulate successful redirect (in real test, would go to Stripe)
      await page.goto('/purchase/success?session_id=cs_test_123')

      // 9. Verify success page
      await expect(page.getByText(/Thank you for your purchase/i)).toBeVisible()
      await expect(page.getByText(/Report will be delivered/i)).toBeVisible()
    })
  })
})
