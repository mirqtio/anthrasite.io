import { test, expect } from './base-test'
import { skipOnMobile } from './helpers/project-filters'

// Configuration for test environments
const TEST_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3333',
    bypassToken: 'dev-bypass-token',
    adminApiKey: 'dev-admin-key',
  },
  staging: {
    baseUrl: process.env.STAGING_URL || '',
    adminApiKey: process.env.STAGING_ADMIN_API_KEY || '',
  },
  production: {
    baseUrl: 'https://www.anthrasite.io',
    adminApiKey: process.env.PROD_ADMIN_API_KEY || '',
  },
}

// Select environment based on env variable
const ENV = process.env.TEST_ENV || 'development'
const config = TEST_CONFIG[ENV as keyof typeof TEST_CONFIG]

test.describe('Purchase Flow E2E Tests', () => {
  let testUtmToken: string
  let testUrls: any

  test.beforeAll(async ({ request }) => {
    // Generate a test UTM token if not in development with bypass
    if (ENV !== 'development' || !config.bypassToken) {
      const response = await request.post(
        `${config.baseUrl}/api/admin/generate-utm`,
        {
          headers: {
            'x-admin-api-key': config.adminApiKey,
          },
          data: {
            businessId: `test-${Date.now()}`,
            businessName: 'E2E Test Business',
            domain: 'e2e-test.example.com',
          },
        }
      )

      expect(response.ok()).toBeTruthy()
      const data = await response.json()
      testUtmToken = data.token
      testUrls = data.urls
    } else {
      // Use bypass token in development
      testUtmToken = config.bypassToken!
      testUrls = {
        purchase: `${config.baseUrl}/purchase?utm=${testUtmToken}`,
        purchaseWithPreview: `${config.baseUrl}/purchase?utm=${testUtmToken}&preview=true`,
        homepage: `${config.baseUrl}/?utm=${testUtmToken}`,
      }
    }
  })

  test('Homepage shows organic content without UTM', async ({ page }) => {
    await page.goto(config.baseUrl)

    // Should see organic homepage
    await expect(page.getByTestId('organic-homepage')).toBeVisible()
    await expect(
      page.getByText('Your website has untapped potential')
    ).toBeVisible()

    // Should not see purchase content
    await expect(page.getByTestId('purchase-homepage')).not.toBeVisible()
  })

  test('Homepage shows purchase content with valid UTM', async ({ page }) => {
    await page.goto(testUrls.homepage)

    // Should see purchase homepage
    await expect(page.getByTestId('purchase-homepage')).toBeVisible()

    // Should not see organic content
    await expect(page.getByTestId('organic-homepage')).not.toBeVisible()
  })

  test('Purchase page preview mode shows all components', async ({ page }) => {
    await page.goto(testUrls.purchaseWithPreview)

    // Should see all purchase page components
    await expect(page.getByTestId('purchase-hero')).toBeVisible()
    await expect(page.getByTestId('report-preview')).toBeVisible()
    await expect(page.getByTestId('trust-signals')).toBeVisible()
    await expect(page.getByTestId('pricing-card')).toBeVisible()

    // Should see checkout button
    const checkoutButton = page.getByRole('button', {
      name: /get.*report|checkout/i,
    })
    await expect(checkoutButton).toBeVisible()
  })

  test('Invalid UTM redirects to homepage', async ({ page }) => {
    await page.goto(`${config.baseUrl}/purchase?utm=invalid-token`)

    // Should redirect to homepage
    await expect(page).toHaveURL(config.baseUrl + '/')

    // Should see organic homepage
    await expect(page.getByTestId('organic-homepage')).toBeVisible()
  })

  test('Missing UTM redirects to homepage', async ({ page }) => {
    await page.goto(`${config.baseUrl}/purchase`)

    // Should redirect to homepage
    await expect(page).toHaveURL(config.baseUrl + '/')
  })

  test('Purchase flow tracking events fire correctly', async ({ page }) => {
    // Set up network monitoring for analytics
    const analyticsRequests: any[] = []

    page.on('request', (request) => {
      if (
        request.url().includes('/api/analytics') ||
        request.url().includes('google-analytics') ||
        request.url().includes('posthog')
      ) {
        analyticsRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        })
      }
    })

    // Visit purchase page
    await page.goto(testUrls.purchaseWithPreview)

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check that page view was tracked
    const pageViewEvents = analyticsRequests.filter(
      (req) =>
        req.postData?.includes('page_view') || req.url.includes('pageview')
    )
    expect(pageViewEvents.length).toBeGreaterThan(0)
  })

  test('Checkout button interaction', async ({ page }) => {
    await page.goto(testUrls.purchaseWithPreview)

    // Find and click checkout button
    const checkoutButton = page.getByRole('button', {
      name: /get.*report|checkout/i,
    })
    await expect(checkoutButton).toBeVisible()

    // In preview mode, clicking shouldn't redirect to Stripe
    await checkoutButton.click()

    // Should still be on the same page (not redirected)
    await expect(page).toHaveURL(testUrls.purchaseWithPreview)
  })

  test('Mobile responsive design', async ({ page }, testInfo) => {
    // Skip on mobile projects - they already have mobile viewports configured
    skipOnMobile(testInfo)

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(testUrls.purchaseWithPreview)

    // Check mobile-specific elements
    await expect(page.getByTestId('mobile-menu-button')).toBeVisible()

    // Pricing card should be full width on mobile
    const pricingCard = page.getByTestId('pricing-card')
    const box = await pricingCard.boundingBox()
    expect(box?.width).toBeGreaterThan(350) // Nearly full width
  })

  test.skip('Performance: Purchase page loads within acceptable time', async ({
    page,
  }) => {
    const startTime = Date.now()

    await page.goto(testUrls.purchaseWithPreview)
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })
})

test.describe('Test Harness Page', () => {
  test.skip('Test harness requires authentication', async ({ page }) => {
    await page.goto(`${config.baseUrl}/test-harness`)

    // Should see auth prompt
    await expect(page.getByText('Test Harness Authentication')).toBeVisible()

    // Should have API key input
    await expect(page.getByPlaceholder('API Key')).toBeVisible()
  })
})
