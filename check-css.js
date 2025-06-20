const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  // Test CSS page
  console.log('Testing CSS page...')
  await page.goto('http://localhost:3000/css-test')
  await page.waitForTimeout(2000)

  // Get computed styles for Tailwind classes
  const styles = await page.evaluate(() => {
    const h2 = document.querySelector('h2.text-4xl')
    const p = document.querySelector('p.text-anthracite-blue')

    return {
      h2: h2
        ? {
            fontSize: window.getComputedStyle(h2).fontSize,
            color: window.getComputedStyle(h2).color,
            className: h2.className,
          }
        : null,
      p: p
        ? {
            color: window.getComputedStyle(p).color,
            className: p.className,
          }
        : null,
    }
  })

  console.log('Computed styles:', JSON.stringify(styles, null, 2))

  await page.screenshot({ path: 'css-test-page.png', fullPage: true })
  console.log('CSS test page screenshot saved to css-test-page.png')

  // Test homepage
  console.log('\nTesting homepage...')
  await page.goto('http://localhost:3000/')
  await page.waitForTimeout(2000)

  await page.screenshot({ path: 'homepage-current.png', fullPage: true })
  console.log('Homepage screenshot saved to homepage-current.png')

  // Get homepage styles
  const homepageStyles = await page.evaluate(() => {
    const mainEl = document.querySelector('main')
    const h1 = document.querySelector('h1')
    const body = document.body

    return {
      bodyBgColor: window.getComputedStyle(body).backgroundColor,
      mainClasses: mainEl?.className || 'no main element',
      h1Text: h1?.textContent || 'no h1',
      h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : 'no h1',
      hasStyleSheets: document.styleSheets.length,
    }
  })

  console.log('\nHomepage styles:', JSON.stringify(homepageStyles, null, 2))

  await browser.close()
})()
