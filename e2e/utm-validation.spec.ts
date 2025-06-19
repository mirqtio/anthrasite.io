import { test, expect } from '@playwright/test'
import { generateUTMUrl } from '@/lib/utm/crypto'
import { createAndStoreToken } from '@/lib/utm/storage'
import { prisma } from '@/lib/db'

test.describe('UTM Parameter Validation', () => {
  // Helper to create test business
  async function createTestBusiness() {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    return await prisma.business.create({
      data: {
        domain: `test-business-${uniqueId}.com`,
        name: `Test Business ${uniqueId}`,
        reportData: {
          score: 85,
          issues: ['Performance', 'SEO'],
        },
      },
    })
  }

  // Helper to cleanup test data
  async function cleanup(businessId?: string) {
    if (businessId) {
      try {
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

  test.describe('Valid UTM flow', () => {
    test('should display purchase page with valid UTM', async ({
      page,
      request,
    }) => {
      // Setup: Create business and generate UTM
      const business = await createTestBusiness()
      const utmUrl = await generateUTMUrl(
        'http://localhost:3000/purchase',
        business.id
      )

      try {
        // Navigate with valid UTM
        await page.goto(utmUrl)

        // Should not be redirected
        expect(page.url()).toContain('/purchase')
        expect(page.url()).toContain('utm=')

        // Validate UTM via API
        const url = new URL(page.url())
        const utm = url.searchParams.get('utm')

        const apiResponse = await request.get(`/api/validate-utm?utm=${utm}`)
        expect(apiResponse.ok()).toBeTruthy()

        const data = await apiResponse.json()
        expect(data.valid).toBe(true)
        expect(data.businessId).toBe(business.id)
        expect(data.businessName).toBe('Test Business')

        // Check that purchase mode cookie is set
        const cookies = await page.context().cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode')
        expect(siteModeCookie?.value).toBe('purchase')
      } finally {
        await cleanup(business.id)
      }
    })

    test('should persist purchase mode on homepage with valid UTM', async ({
      page,
    }) => {
      const business = await createTestBusiness()
      const utmUrl = generateUTMUrl('http://localhost:3000', business.id)

      try {
        // Navigate to homepage with UTM
        await page.goto(utmUrl)

        // Should stay on homepage
        expect(page.url()).toContain('utm=')

        // Purchase mode should be set
        const cookies = await page.context().cookies()
        const siteModeCookie = cookies.find((c) => c.name === 'site_mode')
        expect(siteModeCookie?.value).toBe('purchase')

        // Navigate to homepage again without UTM - should maintain mode
        await page.goto('/')

        const cookiesAfter = await page.context().cookies()
        const siteModeCookieAfter = cookiesAfter.find(
          (c) => c.name === 'site_mode'
        )
        expect(siteModeCookieAfter?.value).toBe('purchase')
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Invalid UTM handling', () => {
    test('should redirect to homepage with missing UTM on protected page', async ({
      page,
    }) => {
      await page.goto('/purchase')

      // Should be redirected to homepage
      await page.waitForURL('/')
      const url = new URL(page.url())
      expect(url.pathname).toBe('/')

      // Check error cookie
      const cookies = await page.context().cookies()
      const errorCookie = cookies.find((c) => c.name === 'utm_error')
      expect(errorCookie?.value).toBe('missing')
    })

    test('should show expiration page for expired UTM', async ({ page }) => {
      // Create an expired token manually
      const expiredPayload = Buffer.from(
        JSON.stringify({
          businessId: 'test',
          nonce: 'expired',
          timestamp: Date.now() - 48 * 60 * 60 * 1000,
          expires: Date.now() - 24 * 60 * 60 * 1000, // Expired
        })
      ).toString('base64url')

      const invalidUtm = `${expiredPayload}.invalidsignature`

      await page.goto(`/purchase?utm=${invalidUtm}`)

      // Should be redirected to expiration page
      await page.waitForURL('/link-expired')

      // Check page content
      await expect(page.locator('h1')).toContainText('Link Expired')
      await expect(page.locator('text=valid for 24 hours')).toBeVisible()

      // Check buttons
      await expect(page.locator('text=Return to Homepage')).toBeVisible()
      await expect(page.locator('text=Contact Support')).toBeVisible()
    })

    test('should redirect for tampered UTM', async ({ page }) => {
      const business = await createTestBusiness()
      const validUrl = generateUTMUrl(
        'http://localhost:3000/purchase',
        business.id
      )

      try {
        // Extract and tamper with UTM
        const url = new URL(validUrl)
        const utm = url.searchParams.get('utm')!
        const tamperedUtm = utm.slice(0, -5) + 'xxxxx' // Change last 5 chars

        await page.goto(`/purchase?utm=${tamperedUtm}`)

        // Should be redirected to homepage
        await page.waitForURL('/')

        // Check error cookie
        const cookies = await page.context().cookies()
        const errorCookie = cookies.find((c) => c.name === 'utm_error')
        expect(errorCookie?.value).toBe('tampered')
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('One-time use enforcement', () => {
    test('should prevent reuse of UTM token', async ({ page, request }) => {
      const business = await createTestBusiness()
      const { token, nonce } = await createAndStoreToken(business.id)
      const utmUrl = generateUTMUrl(
        'http://localhost:3000/purchase',
        business.id
      )

      try {
        // First use - should work
        const url = new URL(utmUrl)
        const utm = url.searchParams.get('utm')!

        const firstResponse = await request.get(`/api/validate-utm?utm=${utm}`)
        expect(firstResponse.ok()).toBeTruthy()

        const firstData = await firstResponse.json()
        expect(firstData.valid).toBe(true)

        // Second use - should fail
        const secondResponse = await request.get(`/api/validate-utm?utm=${utm}`)
        expect(secondResponse.status()).toBe(400)

        const secondData = await secondResponse.json()
        expect(secondData.valid).toBe(false)
        expect(secondData.error).toContain('already been used')
      } finally {
        await cleanup(business.id)
      }
    })
  })

  test.describe('Edge cases', () => {
    test('should handle malformed UTM gracefully', async ({ page }) => {
      const malformedCases = [
        'not-base64',
        'only.one.part',
        'too.many.parts.here',
        '',
        '...',
      ]

      for (const malformed of malformedCases) {
        await page.goto(`/purchase?utm=${malformed}`)

        // Should redirect to homepage
        await page.waitForURL('/')

        // Should not crash
        const url = new URL(page.url())
        expect(url.pathname).toBe('/')
      }
    })

    test('should handle very long UTM parameters', async ({ page }) => {
      const longUtm = 'a'.repeat(10000)

      await page.goto(`/purchase?utm=${longUtm}`)

      // Should redirect gracefully
      await page.waitForURL('/')
      const url = new URL(page.url())
      expect(url.pathname).toBe('/')
    })
  })
})
