const { chromium } = require('playwright')

;(async () => {
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  console.log('Opening http://localhost:3000...')
  await page.goto('http://localhost:3000')

  // Wait for any React to mount
  await page.waitForTimeout(3000)

  // Get the actual rendered HTML
  const html = await page.content()

  // Check what's in the body
  const bodyInfo = await page.evaluate(() => {
    const body = document.body
    const mainEl = document.querySelector('main')
    const loadingEl =
      Array.from(document.querySelectorAll('p')).find((p) =>
        p.textContent?.includes('Loading')
      ) || document.querySelector('[class*="Loading"]')

    return {
      bodyClasses: body.className,
      bodyText: body.innerText?.substring(0, 500),
      hasMain: !!mainEl,
      mainClasses: mainEl?.className || 'no main element',
      mainText: mainEl?.innerText?.substring(0, 200) || 'no text',
      hasLoadingElement: !!loadingEl,
      loadingElementInfo: loadingEl
        ? {
            tag: loadingEl.tagName,
            classes: loadingEl.className,
            text: loadingEl.textContent,
          }
        : null,
      allTextContent: Array.from(document.querySelectorAll('h1, h2, p')).map(
        (el) => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50),
        })
      ),
    }
  })

  console.log('\n=== BODY INFO ===')
  console.log(JSON.stringify(bodyInfo, null, 2))

  // Check React specific things
  const reactInfo = await page.evaluate(() => {
    // Check for React in various ways
    const hasReactDevTools = !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
    const reactFiber =
      document.body._reactRootContainer ||
      document.querySelector('#__next')?._reactRootContainer

    // Look for React props on elements
    const elementsWithReactProps = Array.from(
      document.querySelectorAll('*')
    ).filter((el) => {
      const keys = Object.keys(el)
      return keys.some((key) => key.startsWith('__react'))
    })

    return {
      hasReactDevTools,
      hasReactFiber: !!reactFiber,
      reactElementCount: elementsWithReactProps.length,
      nextDataScript: !!window.__NEXT_DATA__,
      isClientSideRendered: document.querySelector('#__next') !== null,
    }
  })

  console.log('\n=== REACT INFO ===')
  console.log(JSON.stringify(reactInfo, null, 2))

  // Save a screenshot
  await page.screenshot({ path: 'debug-current-state.png', fullPage: true })
  console.log('\nScreenshot saved to debug-current-state.png')

  console.log('\nKeeping browser open for 10 seconds...')
  await page.waitForTimeout(10000)

  await browser.close()
})()
