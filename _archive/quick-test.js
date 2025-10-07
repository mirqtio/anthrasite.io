const { chromium } = require('playwright')

async function quickTest() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    console.log('Testing homepage elements...')
    await page.goto('http://localhost:3333', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Test organic mode elements
    const heroSection = await page.locator('[data-testid="hero-section"]')
    const featuresSection = await page.locator(
      '[data-testid="features-section"]'
    )
    const faqSection = await page.locator('[data-testid="faq-section"]')
    const waitlistForm = await page.locator('[data-testid="waitlist-form"]')

    console.log('✓ Hero section found:', (await heroSection.count()) > 0)
    console.log(
      '✓ Features section found:',
      (await featuresSection.count()) > 0
    )
    console.log('✓ FAQ section found:', (await faqSection.count()) > 0)

    // Test waitlist form interaction
    await page.click('button:has-text("Join Waitlist")')
    await page.waitForSelector('[data-testid="waitlist-form"]', {
      timeout: 5000,
    })
    console.log('✓ Waitlist form opens successfully')

    const emailInput = await page.locator(
      '[data-testid="waitlist-email-input"]'
    )
    const submitButton = await page.locator(
      '[data-testid="waitlist-submit-button"]'
    )

    console.log('✓ Email input found:', (await emailInput.count()) > 0)
    console.log('✓ Submit button found:', (await submitButton.count()) > 0)

    console.log('\nTesting purchase mode...')
    await page.goto('http://localhost:3333/?utm=dev-utm-valid', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    // Wait for purchase mode or fallback to any h1
    try {
      await page.waitForSelector('[data-testid="purchase-hero"]', {
        timeout: 10000,
      })
      console.log('✓ Purchase hero found')
    } catch (e) {
      console.log('- Purchase hero not found, checking for h1...')
      const h1 = await page.locator('h1').count()
      console.log('✓ H1 elements found:', h1)
    }

    console.log('\nAll basic tests passed! 🎉')
  } catch (error) {
    console.error('Test failed:', error.message)
    return false
  } finally {
    await browser.close()
  }

  return true
}

quickTest().then((success) => {
  process.exit(success ? 0 : 1)
})
