import { test, expect } from '@playwright/test'
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

    await test.step('Open waitlist modal', async () => {
      const trigger = page.getByTestId(JourneyIds.openWaitlist)
      await expect(trigger).toBeVisible()
      await trigger.click()

      const form = page.getByTestId(JourneyIds.waitlistForm)
      await expect(form).toBeVisible()
    })

    await test.step('Submit waitlist form', async () => {
      // Use test IDs for stable selectors
      const emailInput = page.getByTestId(JourneyIds.waitlistEmail)
      const domainInput = page.getByTestId(JourneyIds.waitlistDomain)

      await emailInput.fill(`user+${Date.now()}@example.com`)
      await domainInput.fill('example.com')

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
    // Monitor console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
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

      await page.goto(`/purchase?utm=${utm}`)
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
