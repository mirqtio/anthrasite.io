import { test, expect } from '@playwright/test'
import { makeValid, makeExpired, makeTampered } from '../utils/utmTestData'

const UTM_SECRET =
  process.env.UTM_SECRET_KEY || 'development-secret-key-replace-in-production'

test.describe('Purchase page requires valid UTM', () => {
  test('Valid UTM shows purchase page', async ({ page }) => {
    // When I visit "/purchase?utm=<valid>"
    const validToken = makeValid(UTM_SECRET)
    await page.goto(`/purchase?utm=${validToken}`)

    // Then I see purchase content
    const purchaseRoot = page.getByTestId('purchase-root')
    await expect(purchaseRoot).toBeVisible()

    // And I see the purchase page is not redirected
    await expect(page).toHaveURL(/\/purchase/)
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
