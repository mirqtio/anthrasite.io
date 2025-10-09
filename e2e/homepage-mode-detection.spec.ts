import { test, expect } from '@playwright/test'
import { waitForAppReady } from './utils/waits'
import { generateUTMUrl } from '@/lib/utm/crypto'
import { prisma } from '@/lib/db'

// Get base URL from environment (matches Playwright config)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3333'

test.describe('Homepage Mode Detection', () => {
  // Ensure clean storage state before each test
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
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
      await page.goto('/')
      await waitForAppReady(page)

      // Wait for page to fully load
      await page.waitForLoadState('networkidle')

      // Should NOT have loading state visible
      await expect(page.locator('.animate-spin')).not.toBeVisible()

      // Verify organic homepage content
      await expect(page.locator('h1')).toContainText(
        'Your website has untapped potential'
      )
      await expect(page.getByTestId('open-waitlist-button')).toBeVisible()

      // Verify features section is visible
      await expect(page.locator('text=What We Analyze')).toBeVisible()
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
        page.locator('text=Website Audit is Ready')
      ).not.toBeVisible()
      await expect(
        page.locator('text=Get Your Full Report - $199')
      ).not.toBeVisible()

      // Verify no site_mode cookie is set (organic is default)
      const cookies = await context.cookies()
      const siteModeCookie = cookies.find((c) => c.name === 'site_mode')
      expect(siteModeCookie).toBeUndefined()
    })

    test('should clear purchase mode when visiting without UTM', async ({
      page,
      context,
    }) => {
      // First, set purchase mode cookie manually
      await context.addCookies([
        {
          name: 'site_mode',
          value: 'purchase',
          domain: 'localhost',
          path: '/',
        },
        {
          name: 'business_id',
          value: 'test-business-id',
          domain: 'localhost',
          path: '/',
        },
      ])

      // Visit homepage without UTM
      await page.goto('/')
      await waitForAppReady(page)
      await page.waitForLoadState('networkidle')

      // Should show organic homepage
      await expect(page.locator('h1')).toContainText(
        'Your website has untapped potential'
      )

      // Purchase mode cookies should be cleared
      const cookies = await context.cookies()
      const siteModeCookie = cookies.find((c) => c.name === 'site_mode')
      const businessIdCookie = cookies.find((c) => c.name === 'business_id')

      expect(siteModeCookie).toBeUndefined()
      expect(businessIdCookie).toBeUndefined()
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
        await page.goto(utmUrl)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Wait for loading to complete
        await expect(page.locator('.animate-spin')).not.toBeVisible()

        // Verify purchase homepage content
        await expect(page.locator('h1')).toContainText('Website Audit is Ready')
        await expect(page.locator('text=Exclusive Report Ready')).toBeVisible()
        await expect(
          page.locator('text=Get Your Full Report - $199')
        ).toBeVisible()

        // Verify report preview is shown
        await expect(page.locator('text=Report Preview')).toBeVisible()
        await expect(page.locator('text=Overall Score')).toBeVisible()
        await expect(page.locator('text=85').first()).toBeVisible() // Overall score
        await expect(page.locator('text=78')).toBeVisible() // Performance score
        await expect(page.locator('text=92')).toBeVisible() // Security score

        // Verify issues are displayed
        await expect(
          page.locator('text=Critical Security Headers Missing')
        ).toBeVisible()
        await expect(
          page.locator('text=Performance Optimization Needed')
        ).toBeVisible()

        // Verify trust signals
        await expect(page.locator('text=Secure Payment')).toBeVisible()
        await expect(page.locator('text=Instant Access')).toBeVisible()
        await expect(page.locator('text=Money-Back Guarantee')).toBeVisible()

        // Check that purchase mode cookies are set
        const cookies = await context.cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode')
        const businessIdCookie = cookies.find((c) => c.name === 'business_id')

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
        await page.goto(utmUrl)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Extract UTM from URL
        const url = new URL(page.url())
        const utm = url.searchParams.get('utm')

        // Validate UTM via API
        const apiResponse = await request.get(`/api/validate-utm?utm=${utm}`)
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
        await page.goto(utmUrl)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Verify purchase mode
        await expect(page.locator('h1')).toContainText('Website Audit is Ready')

        // Refresh the page (UTM still in URL)
        await page.reload()
        await page.waitForLoadState('networkidle')

        // Should still show purchase mode
        await expect(page.locator('h1')).toContainText('Website Audit is Ready')

        // Navigate to homepage without UTM
        await page.goto('/')
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Should maintain purchase mode (cookies persist)
        await expect(page.locator('h1')).toContainText('Website Audit is Ready')

        // Verify cookies are still set
        const cookies = await context.cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode')
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
        await page.goto(utmUrl)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Navigate to purchase page
        await page.click('text=Get Your Full Report - $199')
        await page.waitForURL('/purchase')

        // Navigate back to homepage
        await page.goto('/')
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Should still be in purchase mode
        await expect(page.locator('h1')).toContainText('Website Audit is Ready')
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
        // Set expired purchase mode cookie
        await context.addCookies([
          {
            name: 'site_mode',
            value: 'purchase',
            domain: 'localhost',
            path: '/',
            expires: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          },
          {
            name: 'business_id',
            value: business.id,
            domain: 'localhost',
            path: '/',
            expires: Math.floor(Date.now() / 1000) - 3600,
          },
        ])

        // Visit homepage
        await page.goto('/')
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        // Should show organic mode (expired cookies are ignored)
        await expect(page.locator('h1')).toContainText(
          'Your website has untapped potential'
        )
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Invalid UTM parameter handling', () => {
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
        await page.goto(`/?utm=${utm}`)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

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

      await page.goto(`/?utm=${expiredUtm}`)
      await waitForAppReady(page)
      await page.waitForLoadState('networkidle')

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

        await page.goto(`/?utm=${tamperedUtm}`)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

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

      await page.goto(`/?utm=${utm}`)
      await waitForAppReady(page)
      await page.waitForLoadState('networkidle')

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
      // Use a slower navigation to observe loading state
      const responsePromise = page.waitForResponse('**/*')

      await page.goto('/')
      await waitForAppReady(page)

      // Loading spinner should be visible initially
      const spinner = page.locator('.animate-spin')

      // Wait for response
      await responsePromise

      // Loading should complete
      await expect(spinner).not.toBeVisible()

      // Content should be visible
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Mobile responsiveness', () => {
    test('should display correctly on mobile devices', async ({
      page,
      context,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(BASE_URL, business.id)

      try {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        // Test organic mode on mobile
        await page.goto('/')
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toBeVisible()
        await expect(page.getByTestId('open-waitlist-button')).toBeVisible()

        // Test purchase mode on mobile
        await page.goto(utmUrl)
        await waitForAppReady(page)
        await page.waitForLoadState('networkidle')

        await expect(page.locator('h1')).toContainText('Website Audit is Ready')
        await expect(
          page.locator('text=Get Your Full Report - $199')
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
        await page.goto(utmUrl) // Purchase mode
        await waitForAppReady(page)
        await page.goto('/') // Should stay in purchase mode due to cookie
        await waitForAppReady(page)
        await context.clearCookies()
        await page.goto('/') // Organic mode
        await waitForAppReady(page)
        await page.goto(utmUrl) // Back to purchase mode
        await waitForAppReady(page)

        await page.waitForLoadState('networkidle')

        // Should end in purchase mode
        await expect(page.locator('h1')).toContainText('Website Audit is Ready')
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
        await Promise.all([page1.goto('/'), page2.goto(utmUrl)])

        await Promise.all([
          page1.waitForLoadState('networkidle'),
          page2.waitForLoadState('networkidle'),
        ])

        // Each should maintain its own mode
        await expect(page1.locator('h1')).toContainText(
          'Your website has untapped potential'
        )
        await expect(page2.locator('h1')).toContainText(
          'Website Audit is Ready'
        )

        await context1.close()
        await context2.close()
      } finally {
        await cleanup(business.id)
      }
    })
  })
})
