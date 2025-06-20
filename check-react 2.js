const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  // Listen for console messages
  page.on('console', (msg) => {
    console.log(`Console ${msg.type()}: ${msg.text()}`)
  })

  // Listen for page errors
  page.on('pageerror', (error) => {
    console.log('Page error:', error.message)
  })

  // Listen for request failures
  page.on('requestfailed', (request) => {
    console.log('Request failed:', request.url(), request.failure()?.errorText)
  })

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  const diagnostics = await page.evaluate(() => {
    return {
      bodyHTML: document.body.innerHTML.substring(0, 500),
      bodyChildrenCount: document.body.children.length,
      hasNextDiv: Boolean(document.getElementById('__next')),
      firstChild: document.body.firstElementChild?.tagName,
      bodyClasses: document.body.className,
      totalElements: document.querySelectorAll('*').length,
      scripts: Array.from(document.scripts).map((s) => ({
        src: s.src,
        inline: !s.src,
      })),
      errors: window.__NEXT_DATA__ ? window.__NEXT_DATA__.err : null,
    }
  })

  console.log('Page Diagnostics:', JSON.stringify(diagnostics, null, 2))

  // Check network responses
  const mainResponse = await page.evaluateHandle(
    () => window.performance.getEntriesByType('navigation')[0]
  )
  const responseData = await mainResponse.jsonValue()
  console.log(
    'Main page response:',
    responseData.name,
    responseData.responseStatus
  )

  await browser.close()
})()
