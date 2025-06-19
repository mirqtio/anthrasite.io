import { test, expect } from '@playwright/test'

test.describe('Basic Functionality', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveURL('/')

    // Check for key elements
    await expect(page.locator('h1')).toBeVisible()
  })

  test('health check endpoint works', async ({ request }) => {
    const response = await request.get('/api/health')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.service).toBe('healthy')
    expect(data.database).toBe('healthy')
  })
})
