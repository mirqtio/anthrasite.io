import { test, expect } from './base-test'
import { waitForAppReady } from './_utils/app-ready'
import { JourneyIds, JourneyA11y } from '../tests/contracts/journeyContract'
import { generateUTMToken } from './helpers/utm-generator'

test.describe('Client-Side Journey Tests @journey', () => {
  test.beforeEach(async ({ page }) => {
    // Force organic mode by default to avoid purchase-homepage variant
    await page.addInitScript(() => {
      document.cookie = 'site_mode=; Max-Age=0; Path=/'
      localStorage.setItem('E2E_MODE', 'organic')
    })
  })

  test('Organic visitor joins waitlist successfully @journey', async ({
    page,
  }) => {
    await test.step('App ready', async () => {
      await waitForAppReady(page)
    })

    await test.step('Verify organic homepage', async () => {
      await expect(
        page.getByRole('heading', {
          name: /Your website has untapped potential/i,
        })
      ).toBeVisible()
    })

    await test.step('Accept cookies', async () => {
      // Dismiss cookie consent banner if present
      const acceptButton = page.getByRole('button', { name: /accept/i })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }
    })

    await test.step('Open waitlist modal', async () => {
      const trigger = page.getByTestId(JourneyIds.openWaitlist)
      await expect(trigger).toBeVisible()
      await trigger.click()

      const form = page.getByTestId(JourneyIds.waitlistForm)
      await expect(form).toBeVisible()
    })

    await test.step('Submit waitlist form - Step 1: Domain', async () => {
      const domainInput = page.getByTestId(JourneyIds.waitlistDomain)
      await domainInput.fill('example.com')

      // Wait for validation to complete (debounced 500ms)
      await page.waitForTimeout(600)

      // Click "Continue" button to move to email step
      const continueButton = page.getByTestId(JourneyIds.waitlistSubmit)
      await expect(continueButton).toBeEnabled()
      await continueButton.click()
    })

    await test.step('Submit waitlist form - Step 2: Email', async () => {
      // Fill email on second step
      const emailInput = page.getByTestId(JourneyIds.waitlistEmail)
      await expect(emailInput).toBeVisible()
      await emailInput.fill(`user+${Date.now()}@example.com`)

      // Click "Join Waitlist" and wait for API call
      const [resp] = await Promise.all([
        page.waitForResponse(/\/api\/waitlist$/),
        page.getByTestId(JourneyIds.waitlistSubmit).click(),
      ])

      expect(resp.ok()).toBeTruthy()
    })

    await test.step('Confirm success UI', async () => {
      // Use test ID for success banner (more stable than text matching)
      await expect(page.getByTestId(JourneyIds.waitlistSuccess)).toBeVisible()
    })
  })

  test('Purchase journey with UTM token @journey', async ({ page }) => {
    // Monitor console errors (filter out expected warnings)
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        // Filter out expected warnings that aren't real errors
        const isExpectedWarning =
          text.includes('Failed to fetch RSC payload') ||
          text.includes('Falling back to browser navigation') ||
          text.includes('GA4 Measurement ID is not defined') ||
          text.includes('PostHog was initialized without a token') ||
          text.includes('Failed to load resource') || // External resources (analytics, etc)
          text.includes('MIME type') || // MIME type errors from test analytics keys
          text.includes('status of 404') || // 404s from external resources
          text.includes('status of 401') // Auth failures from test analytics keys

        if (!isExpectedWarning) {
          consoleErrors.push(text)
        }
      }
    })

    await test.step('App ready', async () => {
      await waitForAppReady(page)
    })

    await test.step('Generate valid UTM and navigate to purchase', async () => {
      const utm = await generateUTMToken({
        businessId: 'test-business-123',
        businessName: 'Test Company',
        price: 9900,
      })

      await page.goto(`/purchase?utm=${utm}`, {
        waitUntil: 'domcontentloaded', // Don't wait for all resources
      })

      // Wait for page to be interactive
      await page.waitForLoadState('networkidle')

      // Dismiss cookie consent banner if present
      const acceptButton = page.getByRole('button', { name: /accept/i })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
        await page.waitForTimeout(300) // Wait for banner animation
      }
    })

    await test.step('Verify purchase page loaded', async () => {
      // Check we're on purchase page with personalization
      await expect(page).toHaveURL(/\/purchase/)

      // Look for key purchase elements (adjust based on actual implementation)
      const purchaseElement =
        (await page.getByText(/Test Company/i).count()) > 0 ||
        (await page.getByText(/\$99/i).count()) > 0 ||
        (await page
          .getByRole('button', { name: /purchase|buy|get/i })
          .count()) > 0

      expect(purchaseElement).toBeTruthy()

      // Verify no console errors occurred
      expect(consoleErrors).toEqual([])
    })
  })
})
