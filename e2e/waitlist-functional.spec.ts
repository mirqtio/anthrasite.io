import { test, expect } from '@playwright/test'

test.describe('Waitlist Form Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should successfully submit waitlist form', async ({ page }) => {
    // Find the waitlist form
    const waitlistForm = page.locator('form').filter({ hasText: 'Enter your website domain' })
    
    // Enter domain
    await waitlistForm.locator('input[type="text"]').fill('mycompany.com')
    await waitlistForm.locator('button:has-text("Continue")').click()
    
    // Wait for email step
    await expect(page.locator('text="Great! We\'ll analyze mycompany.com"')).toBeVisible()
    
    // Enter email
    await waitlistForm.locator('input[type="email"]').fill('test@mycompany.com')
    await waitlistForm.locator('button:has-text("Join Waitlist")').click()
    
    // Wait for success state
    await expect(page.locator('text="You\'re on the list!"')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text=/You\'re number #\\d+/')).toBeVisible()
  })

  test('should validate domain format', async ({ page }) => {
    const waitlistForm = page.locator('form').filter({ hasText: 'Enter your website domain' })
    
    // Try invalid domain
    await waitlistForm.locator('input[type="text"]').fill('not a domain')
    
    // Wait for validation
    await page.waitForTimeout(1000)
    
    // Check for error
    await expect(page.locator('text="Invalid characters in domain"')).toBeVisible()
    
    // Continue button should be disabled
    await expect(waitlistForm.locator('button:has-text("Continue")')).toBeDisabled()
  })

  test('should handle duplicate signups', async ({ page }) => {
    const testDomain = `test${Date.now()}.com`
    const waitlistForm = page.locator('form').filter({ hasText: 'Enter your website domain' })
    
    // First signup
    await waitlistForm.locator('input[type="text"]').fill(testDomain)
    await waitlistForm.locator('button:has-text("Continue")').click()
    await waitlistForm.locator('input[type="email"]').fill('first@test.com')
    await waitlistForm.locator('button:has-text("Join Waitlist")').click()
    await expect(page.locator('text="You\'re on the list!"')).toBeVisible({ timeout: 10000 })
    
    // Note the position
    const positionText = await page.locator('text=/You\'re number #(\\d+)/').textContent()
    const firstPosition = positionText?.match(/#(\d+)/)?.[1]
    
    // Navigate back to form
    await page.goto('/')
    
    // Try to sign up again with same domain
    const newForm = page.locator('form').filter({ hasText: 'Enter your website domain' })
    await newForm.locator('input[type="text"]').fill(testDomain)
    await newForm.locator('button:has-text("Continue")').click()
    await newForm.locator('input[type="email"]').fill('second@test.com')
    await newForm.locator('button:has-text("Join Waitlist")').click()
    
    // Should show same position
    await expect(page.locator('text="You\'re on the list!"')).toBeVisible({ timeout: 10000 })
    await expect(page.locator(`text="You're number #${firstPosition}"`)).toBeVisible()
  })
})