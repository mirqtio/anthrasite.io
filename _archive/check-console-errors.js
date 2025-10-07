const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Capture console messages and errors
  const messages = []
  page.on('console', (msg) =>
    messages.push({ type: msg.type(), text: msg.text() })
  )
  page.on('pageerror', (error) =>
    messages.push({ type: 'error', text: error.toString() })
  )

  await page.goto('http://localhost:3000')
  await page.waitForTimeout(3000)

  console.log('=== Console Messages ===')
  messages.forEach((msg) => {
    console.log(`[${msg.type}] ${msg.text}`)
  })

  // Check for Next.js error overlay
  const errorOverlay = await page.locator('nextjs-portal').count()
  console.log('\n=== Next.js Error Overlay Present:', errorOverlay > 0)

  if (errorOverlay > 0) {
    const errorText = await page.locator('nextjs-portal').innerText()
    console.log('Error:', errorText)
  }

  // Check network for failed resources
  const failedRequests = []
  page.on('requestfailed', (request) => failedRequests.push(request.url()))

  await browser.close()
})()
