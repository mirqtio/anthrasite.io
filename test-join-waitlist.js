const { chromium } = require('playwright')

;(async () => {
  console.log('Starting browser...')
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    console.log('Navigating to http://localhost:3333...')
    await page.goto('http://localhost:3333', { timeout: 30000 })

    console.log('Waiting for page to load...')
    await page.waitForLoadState('domcontentloaded')

    // Handle cookie consent
    console.log('Checking for cookie consent...')
    const acceptAllButton = page.locator('button:has-text("Accept all")')
    if (await acceptAllButton.isVisible()) {
      console.log('Accepting cookies...')
      await acceptAllButton.click()
      await page.waitForTimeout(1000)
    }

    // Wait for the actual content to load (not just the loading state)
    console.log('Waiting for main content to load...')
    await page.waitForSelector(
      'h1:has-text("Your website has untapped potential")',
      { timeout: 30000 }
    )

    console.log('Looking for Join Waitlist button...')
    const joinButton = await page
      .locator('button:has-text("Join Waitlist")')
      .first()
    const isVisible = await joinButton.isVisible()

    console.log(`Join Waitlist button visible: ${isVisible}`)

    if (isVisible) {
      console.log('Button found! Getting button details...')
      const buttonInfo = await joinButton.evaluate((el) => ({
        text: el.textContent,
        disabled: el.disabled,
        classList: Array.from(el.classList),
        style: window.getComputedStyle(el).cssText,
      }))
      console.log('Button info:', buttonInfo)
    } else {
      console.log('Checking all buttons on page...')
      const allButtons = await page.locator('button').all()
      console.log(`Found ${allButtons.length} buttons total`)

      for (let i = 0; i < allButtons.length; i++) {
        const text = await allButtons[i].textContent()
        console.log(`Button ${i + 1}: "${text}"`)
      }
    }
  } catch (error) {
    console.error('Error:', error.message)

    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-screenshot.png' })
    console.log('Screenshot saved as debug-screenshot.png')
  }

  await browser.close()
})()
