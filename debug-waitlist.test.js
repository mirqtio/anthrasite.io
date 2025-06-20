// Quick debug script to test waitlist form
const { test, expect } = require('@playwright/test')

test('debug waitlist form', async ({ page }) => {
  console.log('Starting debug test...')

  // Go to homepage
  await page.goto('http://localhost:3333/')
  await page.waitForLoadState('networkidle')

  // Dismiss cookies
  const acceptButton = page.getByRole('button', { name: 'Accept all cookies' })
  if (await acceptButton.isVisible()) {
    await acceptButton.click()
  }

  // Click join waitlist
  console.log('Clicking Join Waitlist button...')
  await page.locator('button:has-text("Join Waitlist")').first().click()

  // Check if modal appeared
  const modal = page.locator('.modal.active')
  console.log('Modal visible:', await modal.isVisible())

  // Check if input appeared
  const domainInput = page.locator('input[placeholder="example.com"]')
  console.log('Domain input visible:', await domainInput.isVisible())

  if (await domainInput.isVisible()) {
    console.log('Filling domain input...')
    await domainInput.fill('example.com')

    // Wait a bit for validation
    await page.waitForTimeout(2000)

    // Check button state
    const continueBtn = page.getByRole('button', { name: /continue/i })
    console.log('Continue button visible:', await continueBtn.isVisible())
    console.log('Continue button enabled:', await continueBtn.isEnabled())

    // Check for any errors
    const errorText = page.locator('.text-anthracite-error')
    if (await errorText.isVisible()) {
      console.log('Error text:', await errorText.textContent())
    }

    // Check for validation messages
    const validatingText = page.locator('text=Validating domain')
    console.log('Validating message visible:', await validatingText.isVisible())

    // Try clicking continue anyway
    if (await continueBtn.isEnabled()) {
      console.log('Clicking continue button...')
      await continueBtn.click()

      // Check if email step appeared
      const emailText = page.getByText(/great! we'll analyze/i)
      console.log('Email step visible:', await emailText.isVisible())
      if (await emailText.isVisible()) {
        console.log('Email step text:', await emailText.textContent())
      }
    }
  }

  // Take a screenshot for debugging
  await page.screenshot({ path: 'debug-waitlist.png', fullPage: true })
  console.log('Screenshot saved as debug-waitlist.png')
})
