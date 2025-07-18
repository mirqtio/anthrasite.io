import { test, expect } from '@playwright/test'
import { gotoAndDismissCookies } from './helpers/test-utils'

test.describe('Site Mode Selection', () => {
  test.describe('Production Mode', () => {
    test.use({
      contextOptions: {
        // Clear any mock environment variables
      },
    })

    test('homepage without UTM shows organic/waitlist mode', async ({
      page,
    }) => {
      await gotoAndDismissCookies(page, '/')

      // Wait for organic homepage to appear
      await expect(page.getByTestId('organic-homepage')).toBeVisible()

      // Should show organic homepage content
      await expect(page.getByTestId('organic-homepage')).toBeVisible()
      await expect(page.getByTestId('hero-section')).toBeVisible()

      // Should not show purchase content
      await expect(page.getByTestId('purchase-header')).not.toBeVisible()
    })

    test('invalid UTM hash redirects to homepage', async ({ page }) => {
      await gotoAndDismissCookies(page, '/purchase/invalid-hash')

      // Should redirect to homepage
      await page.waitForURL('/')
      await expect(page.getByTestId('organic-homepage')).toBeVisible()
    })
  })

  test.describe('Development Mode with Mock Data', () => {
    test.use({
      contextOptions: {
        // Mock environment variable would be set in the app
      },
    })

    test('homepage without UTM shows organic/waitlist mode in dev', async ({
      page,
    }) => {
      // Set mock mode via query parameter that the app can check
      await gotoAndDismissCookies(page, '/?mock=true')

      // Wait for organic homepage to appear
      await expect(page.getByTestId('organic-homepage')).toBeVisible()

      // Should still show organic homepage even with mock mode
      await expect(page.getByTestId('organic-homepage')).toBeVisible()
      await expect(page.getByTestId('hero-section')).toBeVisible()

      // Should not show purchase content
      await expect(page.getByTestId('purchase-header')).not.toBeVisible()
    })

    test('purchase URL with mock UTM shows purchase mode', async ({ page }) => {
      // Use the mock hash from our mock data as a query parameter
      await gotoAndDismissCookies(page, '/purchase?utm=mock-hash-123')

      // Should show purchase page content
      await expect(page.getByTestId('purchase-header')).toBeVisible()
      await expect(page.getByTestId('purchase-header')).toContainText(
        'Acme Corp'
      )

      // Should show value proposition
      await expect(page.getByTestId('value-proposition')).toBeVisible()
      await expect(page.getByTestId('value-proposition')).toContainText(
        '$2,500 - $5,000 per month'
      )

      // Should show checkout button
      await expect(page.getByTestId('checkout-button')).toBeVisible()
      await expect(page.getByTestId('checkout-button')).toContainText(
        'Get Your Report Now'
      )

      // Should not show organic homepage
      await expect(page.getByTestId('organic-homepage')).not.toBeVisible()
    })

    test('different mock hashes show different business data', async ({
      page,
    }) => {
      // Test first mock business
      await gotoAndDismissCookies(page, '/purchase?utm=mock-hash-123')
      await expect(page.getByTestId('purchase-header')).toContainText(
        'Acme Corp'
      )

      // Test second mock business
      await gotoAndDismissCookies(page, '/purchase?utm=mock-hash-456')
      await expect(page.getByTestId('purchase-header')).toContainText(
        'TechStartup Inc'
      )
    })
  })
})
