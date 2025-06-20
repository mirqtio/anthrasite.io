// Quick test to see the homepage styling
const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto('http://localhost:3000')

  // Keep browser open to see the styling
  console.log('Homepage loaded - check the styling')

  // Wait for user to close
  await new Promise(() => {})
})()
