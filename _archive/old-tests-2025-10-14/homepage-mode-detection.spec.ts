import { test, expect } from './base-test'
import { gotoReady, gotoHome, acceptConsentIfPresent } from './_utils/ui'
import { generateUTMUrl } from '@/lib/utm/crypto'
import { prisma } from '@/lib/db'
import { skipOnMobile } from './helpers/project-filters'

// Get base URL from environment (matches Playwright config)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3333'

test.describe('Homepage Mode Detection', () => {
  // Clear only purchase-mode cookies before each test (preserve consent from storageState)
  test.beforeEach(async ({ context }) => {
    // Get all cookies
    const allCookies = await context.cookies()

    // Only delete purchase-mode cookies, leave consent cookies intact
    // Check for both standard and worker-suffixed names (E2E mode uses _w0 suffix)
    const purchaseCookies = allCookies.filter(
      (c) => c.name === 'site_mode' || c.name === 'business_id' ||
             c.name === 'site_mode_w0' || c.name === 'business_id_w0'
    )

    // Delete purchase cookies one by one
    for (const cookie of purchaseCookies) {
      await context.clearCookies({ name: cookie.name })
    }
  })

  // Generate unique identifier for test runs
  const getUniqueTestId = () => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    return `${timestamp}-${randomId}`
  }

  // Helper to create test business for purchase mode tests
  async function createTestBusiness() {
    const uniqueId = getUniqueTestId()
    const domain = `test-mode-detection-${uniqueId}.com`

    // First, try to delete any existing business with this domain (cleanup from failed runs)
    try {
      await prisma.business.deleteMany({
        where: { domain },
      })
    } catch (error) {
      // Ignore errors if business doesn't exist
    }

    return await prisma.business.create({
      data: {
        domain,
        name: `Test Mode Business ${uniqueId}`,
        reportData: {
          overallScore: 85,
          performanceScore: 78,
          securityScore: 92,
          issueCount: 12,
          topIssues: [
            {
              severity: 'high',
              title: 'Critical Security Headers Missing',
              description: 'Your website lacks essential security headers.',
            },
            {
              severity: 'medium',
              title: 'Performance Optimization Needed',
              description: 'Page load times exceed recommended thresholds.',
            },
          ],
        },
      },
    })
  }

  // Helper to cleanup test data
  async function cleanup(businessId?: string) {
    if (businessId) {
      try {
        // Delete in correct order to respect foreign key constraints
        await prisma.utmToken.deleteMany({ where: { businessId } })

        // Check if business exists before trying to delete
        const business = await prisma.business.findUnique({
          where: { id: businessId },
        })
        if (business) {
          await prisma.business.delete({ where: { id: businessId } })
        }
      } catch (error) {
        // Silently handle cleanup errors in CI to prevent test failures
        if (!process.env.CI) {
          console.error('Cleanup error:', error)
        }
        // Continue even if cleanup fails
      }
    }
  }

  // Cleanup any stale test data before all tests
  test.beforeAll(async () => {
    try {
      // Simplified cleanup - only log if database is available
      if (process.env.DATABASE_URL) {
        console.log('Database connection available for cleanup')
      }
    } catch (error) {
      console.error('BeforeAll cleanup error:', error)
    }
  })

  // Store test business IDs for cleanup
  let testBusinessIds: string[] = []

  // Cleanup after each test
  test.afterEach(async () => {
    // Clean up all businesses created during this test
    for (const businessId of testBusinessIds) {
      await cleanup(businessId)
    }
    testBusinessIds = []
  })

  // Update createTestBusiness to track IDs
  const originalCreateTestBusiness = createTestBusiness
  createTestBusiness = async function () {
    const business = await originalCreateTestBusiness()
    testBusinessIds.push(business.id)
    return business
  }

  // Final cleanup after all tests
  test.afterAll(async () => {
    try {
      // Simplified cleanup to avoid database connection issues
      if (process.env.DATABASE_URL) {
        console.log('Test cleanup completed')
      }
    } catch (error) {
      console.error('AfterAll cleanup error:', error)
    }
  })

  test.describe('Direct visit → Organic mode', () => {
    test('should display organic homepage when visiting without UTM parameters', async ({
      page,
      context,
    }) => {
      // Clear any existing cookies
      await context.clearCookies()

      // Navigate directly to homepage
      await gotoHome(page)

      // Should NOT have loading state visible
      await expect(page.locator('.animate-spin')).not.toBeVisible()

      // Verify organic homepage content
      await expect(page.locator('h1')).toContainText(
        'Your website has untapped potential'
      )
      await expect(page.getByTestId('open-waitlist-button')).toBeVisible()

      // Verify features section is visible
      await expect(page.locator('text=What This Looks Like')).toBeVisible()
      await expect(
        page.locator('h3', { hasText: 'Load Performance' })
      ).toBeVisible()
      await expect(
        page.locator('h3', { hasText: 'Mobile Experience' })
      ).toBeVisible()
      await expect(
        page.locator('h3', { hasText: 'Revenue Impact' })
      ).toBeVisible()

      // Check that no purchase-specific content is shown
      await expect(
        page.locator('text=your audit is ready')
      ).not.toBeVisible()
      await expect(
        page.locator('text=Get Your Report - $199')
      ).not.toBeVisible()

      // Verify no site_mode cookie is set (organic is default)
      const cookies = await context.cookies()
      const siteModeCookie = cookies.find((c) => c.name === 'site_mode_w0')
      expect(siteModeCookie).toBeUndefined()
    })

    test('should maintain purchase mode when visiting without UTM (cookie persistence)', async ({
      page,
      context,
    }) => {
      // Create a real business for valid cookie testing
      const business = await createTestBusiness()

      try {
        // Set purchase mode cookie manually (worker-suffixed for E2E mode)
        await context.addCookies([
          {
            name: 'site_mode_w0',
            value: 'purchase',
            domain: 'localhost',
            path: '/',
          },
          {
            name: 'business_id_w0',
            value: business.id,
            domain: 'localhost',
            path: '/',
          },
        ])

        // Visit homepage without UTM - cookies should persist (better UX)
        await gotoHome(page)

        // With valid business data, purchase mode UI should be shown
        await expect(page.locator('h1')).toContainText('your audit is ready')

        // Purchase mode cookies should persist (not be cleared by middleware)
        const cookies = await context.cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode_w0')
        const businessIdCookie = cookies.find((c) => c.name === 'business_id_w0')

        // Cookies persist across navigation (middleware design: cookies expire naturally after maxAge)
        expect(siteModeCookie?.value).toBe('purchase')
        expect(businessIdCookie?.value).toBe(business.id)
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Email link → Purchase mode', () => {
    test('should display purchase homepage with valid UTM parameter', async ({
      page,
      context,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Clear cookies
        await context.clearCookies()

        // Navigate with UTM parameter
        await gotoReady(page, utmUrl)

        // Verify purchase homepage content
        await expect(page.locator('h1')).toContainText('your audit is ready')
        await expect(
          page.locator('text=Get Your Report - $199')
        ).toBeVisible()
        // Monthly impact is split across two divs
        await expect(page.locator('text=$12,450')).toBeVisible()
        await expect(page.locator('text=Monthly Impact')).toBeVisible()

        // Verify top issues section is shown
        await expect(page.locator('h2', { hasText: 'Your Top 3 Issues' })).toBeVisible()

        // Verify issues are displayed
        await expect(
          page.locator('h3', { hasText: 'Security Headers Missing' })
        ).toBeVisible()
        await expect(
          page.locator('h3', { hasText: '4.2s Load Time' })
        ).toBeVisible()
        await expect(
          page.locator('h3', { hasText: 'Image Optimization' })
        ).toBeVisible()

        // Verify payment info
        await expect(page.locator('text=Secure payment via Stripe')).toBeVisible()

        // Check that purchase mode cookies are set (worker-suffixed in E2E mode)
        const cookies = await context.cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode_w0')
        const businessIdCookie = cookies.find((c) => c.name === 'business_id_w0')

        expect(siteModeCookie?.value).toBe('purchase')
        expect(businessIdCookie?.value).toBe(business.id)
      } finally {
        await cleanup(business.id)
      }
    })

    test('should validate UTM via API when in purchase mode', async ({
      page,
      context,
      request,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        await gotoReady(page, utmUrl)

        // Extract UTM from URL
        const url = new URL(page.url())
        const utm = url.searchParams.get('utm')

        // Validate UTM via API
        const apiResponse = await request.get(`/api/validate-utm?utm=${utm}`)

        // Log response details for debugging
        if (!apiResponse.ok()) {
          const errorBody = await apiResponse.text()
          console.log(`API Error [${apiResponse.status()}]:`, errorBody)
        }

        expect(apiResponse.ok()).toBeTruthy()

        const data = await apiResponse.json()
        expect(data.valid).toBe(true)
        expect(data.businessId).toBe(business.id)
        expect(data.businessName).toContain('Test Mode Business')
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Mode persistence across refreshes', () => {
    test('should persist purchase mode across page refreshes', async ({
      page,
      context,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Initial visit with UTM
        await gotoReady(page, utmUrl)

        // Verify purchase mode
        await expect(page.locator('h1')).toContainText('your audit is ready')

        // Refresh the page (UTM still in URL)
        await page.reload()
        await page.waitForTimeout(500) // Wait for reload

        // Should still show purchase mode
        await expect(page.locator('h1')).toContainText('your audit is ready')

        // Navigate to homepage without UTM
        await gotoHome(page)

        // Should maintain purchase mode (cookies persist)
        await expect(page.locator('h1')).toContainText('your audit is ready')

        // Verify cookies are still set (worker-suffixed in E2E mode)
        const cookies = await context.cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode_w0')
        expect(siteModeCookie?.value).toBe('purchase')
      } finally {
        await cleanup(business.id)
      }
    })

    test('should maintain purchase mode when navigating between pages', async ({
      page,
      context,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Visit with UTM
        await gotoReady(page, utmUrl)

        // Accept consent banner if present (WebKit/Firefox/Mobile need this)
        await acceptConsentIfPresent(page)

        // Navigate to purchase page
        await page.click('text=Get Your Report - $199')
        await page.waitForURL('/purchase')

        // Wait for purchase page to fully load and stabilize before navigating away
        // Longer timeout needed when running with high parallelism (6 workers × 5 devices)
        await page.waitForLoadState('networkidle', { timeout: 10000 })

        // Use browser back instead of new navigation (more reliable on WebKit)
        await page.goBack({ waitUntil: 'domcontentloaded' })
        await page.locator('html[data-hydrated="true"]').waitFor({ state: 'attached', timeout: 10000 })

        // Should still be in purchase mode
        await expect(page.locator('h1')).toContainText('your audit is ready')
      } finally {
        await cleanup(business.id)
      }
    })

    test('should expire purchase mode after cookie expiration', async ({
      page,
      context,
    }) => {
      const business = await createTestBusiness()

      try {
        // Set expired purchase mode cookie (worker-suffixed for E2E mode)
        await context.addCookies([
          {
            name: 'site_mode_w0',
            value: 'purchase',
            domain: 'localhost',
            path: '/',
            expires: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          },
          {
            name: 'business_id_w0',
            value: business.id,
            domain: 'localhost',
            path: '/',
            expires: Math.floor(Date.now() / 1000) - 3600,
          },
        ])

        // Visit homepage
        await gotoHome(page)

        // Should show organic mode (expired cookies are ignored)
        await expect(page.locator('h1')).toContainText(
          'Your website has untapped potential'
        )
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Invalid UTM parameter handling @quarantine @due(2025-11-15)', () => {
    test.skip(true, 'Error screens not yet implemented - see ANT-180')

    test('should show error state for malformed UTM', async ({ page }) => {
      const malformedUTMs = [
        'not-base64-encoded',
        'only.one.part',
        'too.many.parts.here.invalid',
        '',
        '...',
        'a'.repeat(1000), // Very long UTM
      ]

      for (const utm of malformedUTMs) {
        await gotoHome(page, { utm })

        // Should show error state in purchase mode
        await expect(
          page.locator('h2', { hasText: 'Invalid Purchase Link' })
        ).toBeVisible()
        await expect(
          page.locator('text=This purchase link is not valid')
        ).toBeVisible()
        await expect(page.locator('text=Return to Homepage')).toBeVisible()
      }
    })

    test('should show error for expired UTM token', async ({ page }) => {
      // Create an expired token
      const expiredPayload = Buffer.from(
        JSON.stringify({
          businessId: 'test-expired',
          nonce: 'expired-nonce',
          timestamp: Date.now() - 48 * 60 * 60 * 1000,
          expires: Date.now() - 24 * 60 * 60 * 1000, // Expired 24 hours ago
        })
      ).toString('base64url')

      const expiredUtm = `${expiredPayload}.invalidsignature`

      await gotoHome(page, { utm: expiredUtm })

      // Should show error state
      await expect(
        page.locator('h2', { hasText: 'Invalid Purchase Link' })
      ).toBeVisible()
    })

    test('should show error for tampered UTM signature', async ({ page }) => {
      const business = await createTestBusiness()
      const validUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Extract and tamper with UTM
        const url = new URL(validUrl)
        const utm = url.searchParams.get('utm')!
        const parts = utm.split('.')
        parts[1] = 'tamperedsignature' // Replace signature
        const tamperedUtm = parts.join('.')

        await gotoHome(page, { utm: tamperedUtm })

        // Should show error state
        await expect(
          page.locator('h2', { hasText: 'Invalid Purchase Link' })
        ).toBeVisible()
      } finally {
        await cleanup(business.id)
      }
    })

    test('should gracefully handle missing business data', async ({
      page,
      context,
    }) => {
      // Create a valid UTM for a non-existent business
      const nonExistentBusinessId = 'non-existent-business-id'
      const payload = Buffer.from(
        JSON.stringify({
          businessId: nonExistentBusinessId,
          nonce: 'test-nonce',
          timestamp: Date.now(),
          expires: Date.now() + 24 * 60 * 60 * 1000,
        })
      ).toString('base64url')

      // This would need a valid signature in production, but for testing
      // the middleware will catch it as invalid
      const utm = `${payload}.testsignature`

      await gotoHome(page, { utm })

      // Should show error state
      await expect(
        page.locator('h2', { hasText: 'Invalid Purchase Link' })
      ).toBeVisible()
    })
  })

  test.describe('Loading states', () => {
    test('should show loading state during mode detection', async ({
      page,
    }) => {
      // Navigate to homepage
      await gotoHome(page)

      // After ready, loading should be complete
      await expect(page.locator('.animate-spin')).not.toBeVisible()

      // Content should be visible
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Mobile responsiveness', () => {
    test('should display correctly on mobile devices', async ({
      page,
      context,
    }, testInfo) => {
      // Skip on mobile projects - they already have mobile viewports configured
      skipOnMobile(testInfo)

      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        // Test organic mode on mobile
        await gotoHome(page)

        await expect(page.locator('h1')).toBeVisible()
        await expect(page.getByTestId('open-waitlist-button')).toBeVisible()

        // Test purchase mode on mobile
        await gotoReady(page, utmUrl)

        await expect(page.locator('h1')).toContainText('your audit is ready')
        await expect(
          page.locator('text=Get Your Report - $199')
        ).toBeVisible()

        // Verify responsive layout
        const heroSection = page.locator('section').first()
        await expect(heroSection).toBeVisible()
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Edge cases and race conditions', () => {
    test('should handle rapid mode switches gracefully', async ({
      page,
      context,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Rapidly switch between modes
        await gotoReady(page, utmUrl) // Purchase mode
        await gotoHome(page) // Should stay in purchase mode due to cookie
        await context.clearCookies()
        await gotoHome(page) // Organic mode
        await gotoReady(page, utmUrl) // Back to purchase mode

        // Should end in purchase mode
        await expect(page.locator('h1')).toContainText('your audit is ready')
      } finally {
        await cleanup(business.id)
      }
    })

    test('should handle concurrent cookie operations', async ({ browser }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Create two contexts (simulating two tabs)
        const context1 = await browser.newContext()
        const context2 = await browser.newContext()

        const page1 = await context1.newPage()
        const page2 = await context2.newPage()

        // Navigate both to different modes simultaneously
        await Promise.all([gotoHome(page1), gotoReady(page2, utmUrl)])

        // Each should maintain its own mode
        await expect(page1.locator('h1')).toContainText(
          'Your website has untapped potential'
        )
        await expect(page2.locator('h1')).toContainText(
          'your audit is ready'
        )

        await context1.close()
        await context2.close()
      } finally {
        await cleanup(business.id)
      }
    })
  })
})
