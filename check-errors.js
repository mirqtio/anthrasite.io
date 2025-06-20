const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Collect console messages
  const consoleMessages = []
  page.on('console', (msg) =>
    consoleMessages.push({ type: msg.type(), text: msg.text() })
  )

  // Collect errors
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.toString()))

  // Navigate to the site
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

  // Wait a bit for any async errors
  await page.waitForTimeout(2000)

  // Get page content
  const content = await page.content()
  const title = await page.title()

  console.log('Page Title:', title)
  console.log('\nConsole Messages:')
  consoleMessages.forEach((msg) => console.log(`[${msg.type}] ${msg.text}`))

  console.log('\nPage Errors:')
  pageErrors.forEach((error) => console.log(error))

  // Check if main content exists
  const hasHero = await page.locator('h1').count()
  const hasWaitlistForm = await page.locator('form').count()

  console.log('\nPage Structure:')
  console.log('Has H1:', hasHero > 0)
  console.log('Has Form:', hasWaitlistForm > 0)

  // Check what's actually visible
  const visibleText = await page.locator('body').innerText()
  console.log('\nVisible Text (first 500 chars):')
  console.log(visibleText.substring(0, 500))

  await browser.close()
})()
