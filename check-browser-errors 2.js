const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  // Capture console messages
  const consoleMessages = []
  page.on('console', (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
    })
  })

  // Capture page errors
  const pageErrors = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  console.log('Navigating to http://localhost:3000...')
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

  // Wait for potential client-side rendering
  await page.waitForTimeout(3000)

  // Check what's actually rendered
  const bodyText = await page.locator('body').innerText()
  const hasLoadingText = bodyText.includes('Loading...')
  const hasHeroText = bodyText.includes('Automated Website Audits')
  const mainElement = await page.locator('main').count()

  console.log('\n=== PAGE STATE ===')
  console.log('Has Loading text:', hasLoadingText)
  console.log('Has Hero text:', hasHeroText)
  console.log('Main elements found:', mainElement)
  console.log('Body text length:', bodyText.length)

  console.log('\n=== CONSOLE MESSAGES ===')
  consoleMessages.forEach((msg) => {
    console.log(`[${msg.type}] ${msg.text}`)
  })

  console.log('\n=== PAGE ERRORS ===')
  if (pageErrors.length === 0) {
    console.log('No page errors')
  } else {
    pageErrors.forEach((err) => console.log(err))
  }

  // Check React state
  const reactState = await page.evaluate(() => {
    const hasReactRoot = document.querySelector('#__next') !== null
    const reactVersion = window.React ? window.React.version : 'Not found'
    return { hasReactRoot, reactVersion }
  })

  console.log('\n=== REACT STATE ===')
  console.log('Has React root:', reactState.hasReactRoot)
  console.log('React version:', reactState.reactVersion)

  // Keep browser open for 10 seconds so you can see it
  console.log('\nKeeping browser open for 10 seconds...')
  await page.waitForTimeout(10000)

  await browser.close()
})()
