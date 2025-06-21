const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Set viewport
  await page.setViewportSize({ width: 1440, height: 900 })

  // Navigate to the site
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

  // Take screenshots
  await page.screenshot({ path: 'homepage-full.png', fullPage: true })
  await page.screenshot({ path: 'homepage-viewport.png' })

  // Also capture mobile view
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'homepage-mobile.png' })

  await browser.close()
  console.log('Screenshots captured successfully')
})()
