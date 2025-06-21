const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('Capturing current state of homepage...')
  await page.goto('http://localhost:3000')
  await page.waitForTimeout(3000)

  // Capture screenshot
  await page.screenshot({ path: 'current-homepage-issue.png', fullPage: true })

  // Get all text content to understand what's rendering
  const pageInfo = await page.evaluate(() => {
    // Get all text content
    const allText = document.body.innerText

    // Get computed styles for key elements
    const body = document.body
    const main = document.querySelector('main')
    const h1 = document.querySelector('h1')
    const svgs = document.querySelectorAll('svg')

    // Check for stylesheets
    const stylesheets = Array.from(document.styleSheets).map((sheet) => ({
      href: sheet.href,
      cssRules: sheet.cssRules ? sheet.cssRules.length : 0,
    }))

    return {
      bodyStyles: {
        backgroundColor: window.getComputedStyle(body).backgroundColor,
        color: window.getComputedStyle(body).color,
        fontFamily: window.getComputedStyle(body).fontFamily,
        fontSize: window.getComputedStyle(body).fontSize,
      },
      h1Styles: h1
        ? {
            fontSize: window.getComputedStyle(h1).fontSize,
            color: window.getComputedStyle(h1).color,
            fontWeight: window.getComputedStyle(h1).fontWeight,
            className: h1.className,
          }
        : 'No h1 found',
      svgCount: svgs.length,
      firstSvgSize: svgs[0]
        ? {
            width: window.getComputedStyle(svgs[0]).width,
            height: window.getComputedStyle(svgs[0]).height,
            viewBox: svgs[0].getAttribute('viewBox'),
          }
        : null,
      stylesheets,
      textPreview: allText.substring(0, 200),
    }
  })

  console.log('\nPage Information:')
  console.log(JSON.stringify(pageInfo, null, 2))

  // Check console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Console error:', msg.text())
    }
  })

  // Wait to see console errors
  await page.waitForTimeout(2000)

  console.log('\nScreenshot saved to current-homepage-issue.png')
  console.log('Browser will stay open for 5 seconds...')
  await page.waitForTimeout(5000)

  await browser.close()
})()
