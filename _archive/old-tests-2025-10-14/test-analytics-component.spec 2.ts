import { test, expect } from '@playwright/test'

test('Analytics Component Rendering Test', async ({ page }) => {
  // Enable all console logs
  page.on('console', (msg) => {
    console.log(`Browser [${msg.type()}]:`, msg.text())
  })

  // Check if Analytics component is rendered
  await page.goto('http://localhost:3333')

  // Add debug code to check component rendering
  const componentCheck = await page.evaluate(() => {
    // Check if React is available
    const hasReact =
      !!(window as any).React ||
      !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__

    // Check for Analytics-related elements or attributes
    const analyticsElements = document.querySelectorAll(
      '[data-analytics], [data-ga], [data-gtag]'
    )

    // Check window properties
    return {
      hasReact,
      analyticsElementsCount: analyticsElements.length,
      windowKeys: Object.keys(window).filter(
        (key) =>
          key.includes('analytics') ||
          key.includes('gtag') ||
          key.includes('dataLayer') ||
          key.includes('GA')
      ),
      // Check if Next.js is present
      hasNextData: !!(window as any).__NEXT_DATA__,
      nextBuildId: (window as any).__NEXT_DATA__?.buildId,
    }
  })

  console.log('\n=== Component Check ===')
  console.log(JSON.stringify(componentCheck, null, 2))

  // Try to manually initialize analytics
  const manualInit = await page.evaluate(() => {
    try {
      // Try to access the NEXT_PUBLIC env vars
      const measurementId = 'G-G285FN4YDQ' // Hardcoded since we know the value

      // Manually create and append GA4 script
      const script = document.createElement('script')
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      script.async = true
      document.head.appendChild(script)

      // Initialize gtag
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).gtag = function (...args: any[]) {
        ;(window as any).dataLayer.push(args)
      }
      ;(window as any).gtag('js', new Date())
      ;(window as any).gtag('config', measurementId)

      return 'Manual initialization complete'
    } catch (error: any) {
      return `Error: ${error.message}`
    }
  })

  console.log('\n=== Manual Initialization ===')
  console.log(manualInit)

  // Wait and check if it worked
  await page.waitForTimeout(3000)

  const finalStatus = await page.evaluate(() => {
    const scriptTag = document.querySelector(
      'script[src*="googletagmanager.com"]'
    )
    return {
      hasGtag: typeof (window as any).gtag !== 'undefined',
      hasDataLayer: typeof (window as any).dataLayer !== 'undefined',
      dataLayerLength: (window as any).dataLayer
        ? (window as any).dataLayer.length
        : 0,
      gtagScript: !!scriptTag,
      scriptSrc: scriptTag ? scriptTag.getAttribute('src') : null,
    }
  })

  console.log('\n=== Final Status ===')
  console.log(JSON.stringify(finalStatus, null, 2))

  // Monitor network for GA4 requests
  const ga4RequestPromise = page
    .waitForRequest(
      (request) =>
        request.url().includes('google-analytics.com') ||
        request.url().includes('analytics'),
      { timeout: 5000 }
    )
    .catch(() => null)

  // Trigger a page view
  await page.goto('http://localhost:3333/pricing')

  const ga4Request = await ga4RequestPromise
  console.log('\n=== GA4 Request ===')
  console.log(
    ga4Request ? `Found: ${ga4Request.url()}` : 'No GA4 requests detected'
  )
})
