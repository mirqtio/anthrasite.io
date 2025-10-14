import { test, expect } from '@playwright/test'
import { makeValid, makeExpired, makeTampered } from '../utils/utmTestData'
import { PrismaClient } from '@prisma/client'

const UTM_SECRET =
  process.env.UTM_SECRET_KEY || 'development-secret-key-replace-in-production'

const prisma = new PrismaClient()

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

      const business = await prisma.business.findUnique({
        where: { id: businessId },
      })
      if (business) {
        await prisma.business.delete({ where: { id: businessId } })
      }
    } catch (error) {
      if (!process.env.CI) {
        console.error('Cleanup error:', error)
      }
    }
  }
}

test.describe('Purchase page requires valid UTM', () => {
  test('Valid UTM shows purchase page', async ({ page }) => {
    // Setup: Create business and generate UTM with that businessId
    const business = await createTestBusiness()

    try {
      // When I visit "/purchase?utm=<valid>" with the business's ID
      const validToken = makeValid(UTM_SECRET, { businessId: business.id })
      await page.goto(`/purchase?utm=${validToken}`)

      // Then I see purchase content
      const purchaseRoot = page.getByTestId('purchase-root')
      await expect(purchaseRoot).toBeVisible()

      // And I see the purchase page is not redirected
      await expect(page).toHaveURL(/\/purchase/)
    } finally {
      await cleanup(business.id)
    }
  })

  test('Missing UTM redirects to homepage', async ({ page }) => {
    // When I visit "/purchase"
    await page.goto('/purchase')

    // Then I am on "/"
    await expect(page).toHaveURL('/')
  })

  test('Tampered UTM redirects to homepage', async ({ page }) => {
    // When I visit "/purchase?utm=<tampered>"
    const tamperedToken = makeTampered(UTM_SECRET)
    await page.goto(`/purchase?utm=${tamperedToken}`)

    // Then I am on "/"
    await expect(page).toHaveURL('/')
  })

  test('Expired UTM redirects to link-expired page', async ({ page }) => {
    // When I visit "/purchase?utm=<expired>"
    const expiredToken = makeExpired(UTM_SECRET)
    await page.goto(`/purchase?utm=${expiredToken}`)

    // Then I am on "/link-expired"
    await expect(page).toHaveURL('/link-expired')
  })
})
