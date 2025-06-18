const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })

  // Get full page HTML
  const html = await page.content()

  // Check if it's a 404
  const is404 =
    html.includes('404') && html.includes('This page could not be found')
  console.log('Is 404 page:', is404)

  // Check for React
  const hasReactRoot = await page.evaluate(() => {
    return (
      document.querySelector('#__next') !== null ||
      document.querySelector('[data-reactroot]') !== null
    )
  })
  console.log('Has React root:', hasReactRoot)

  // Check body content
  const bodyText = await page.locator('body').innerText()
  console.log('Body text length:', bodyText.length)
  console.log('Body text preview:', bodyText.substring(0, 200))

  // Save HTML to file for inspection
  require('fs').writeFileSync('page-output.html', html)
  console.log('HTML saved to page-output.html')

  await browser.close()
})()
