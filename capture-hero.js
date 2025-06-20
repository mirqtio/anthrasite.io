const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Set viewport
  await page.setViewportSize({ width: 1440, height: 900 })

  // Navigate to the site
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

  // Scroll to top to ensure hero is visible
  await page.evaluate(() => window.scrollTo(0, 0))

  // Wait for animations
  await page.waitForTimeout(1000)

  // Take hero screenshot
  await page.screenshot({ path: 'hero-section.png' })

  // Scroll down to see more content
  await page.evaluate(() => window.scrollBy(0, 600))
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'features-section.png' })

  // Check for waitlist form and capture it
  const form = await page.locator('form').first()
  if (form) {
    await form.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
    await page.screenshot({ path: 'waitlist-form.png' })
  }

  await browser.close()
  console.log('Screenshots captured successfully')
})()
