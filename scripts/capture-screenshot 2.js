const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  console.log('Navigating to homepage...')
  await page.goto('http://localhost:3333')
  await page.waitForTimeout(2000) // Wait for styles to load

  await page.screenshot({ path: 'homepage-screenshot.png', fullPage: true })
  console.log('Screenshot saved as homepage-screenshot.png')

  // Also capture the purchase page
  console.log('Navigating to purchase page...')
  await page.goto('http://localhost:3333/purchase?utm=mock-hash-123')
  await page.waitForTimeout(2000)

  await page.screenshot({ path: 'purchase-screenshot.png', fullPage: true })
  console.log('Screenshot saved as purchase-screenshot.png')

  await browser.close()
})()
