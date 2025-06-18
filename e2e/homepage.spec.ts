import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/Anthrasite/)

    const heading = page.getByRole('heading', { name: 'Anthrasite' })
    await expect(heading).toBeVisible()

    const subtitle = page.getByText('Website Audit Tool - Coming Soon')
    await expect(subtitle).toBeVisible()
  })
})
