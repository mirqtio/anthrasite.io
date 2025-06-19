import { test, expect } from '@playwright/test'
import { gotoAndDismissCookies } from './helpers/test-utils'

test.describe('Homepage', () => {
  test('should display the homepage', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Check page title
    await expect(page).toHaveTitle(/Anthrasite/)

    // Check main heading
    const heading = page.getByRole('heading', { name: 'Your website has untapped potential' })
    await expect(heading).toBeVisible()

    // Check key content sections
    await expect(page.getByText('We find the problems costing you money')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Join Waitlist' })).toBeVisible()
  })
})
