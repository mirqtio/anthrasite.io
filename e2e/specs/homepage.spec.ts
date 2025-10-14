import { test, expect } from '@playwright/test'

test.describe('Homepage is reachable and renders core content', () => {
  test('Homepage loads', async ({ page }) => {
    // When I visit "/"
    await page.goto('/')

    // Then the page has title
    await expect(page).toHaveTitle(/Anthrasite/i)

    // And I see the primary hero content
    const heroSection = page.getByTestId('hero-home')
    await expect(heroSection).toBeVisible()
  })
})
