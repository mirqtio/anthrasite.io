import { test, expect } from '@playwright/test'
import { gotoAndDismissCookies } from './helpers/test-utils'

test.describe('Homepage Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAndDismissCookies(page, '/')
    // Wait for content to load by waiting for the main element to be visible
    await page.waitForSelector('main', { state: 'visible', timeout: 10000 })
  })

  test('should render hero section with correct content', async ({ page }) => {
    // Check for main headline
    const headline = page.locator('h1')
    await expect(headline).toBeVisible()
    await expect(headline).toHaveText('Your website has untapped potential')

    // Check for subheadline
    const subheadline = page.locator(
      "text=We analyze thousands of data points to show you what to fix and what it's worth."
    )
    await expect(subheadline).toBeVisible()

    // Check for CTAs
    await expect(page.locator('button:has-text("Join Waitlist")')).toBeVisible()
  })

  test('should render features section', async ({ page }) => {
    // Check for section title
    await expect(page.locator('h2:has-text("What We Analyze")')).toBeVisible()

    // Check for feature cards - update to actual content
    await expect(page.locator('text=Technical Performance')).toBeVisible()
    await expect(page.locator('text=Security & Privacy')).toBeVisible()
    await expect(page.locator('text=User Experience')).toBeVisible()

    // Check that feature descriptions are visible
    await expect(page.locator('text=Core Web Vitals')).toBeVisible()
    await expect(page.locator('text=HTTPS')).toBeVisible()
    await expect(page.locator('text=Mobile-first')).toBeVisible()
  })

  test('should render waitlist form section', async ({ page }) => {
    // Click Join Waitlist to open modal
    await page.locator('button:has-text("Join Waitlist")').click()

    // Wait for modal to appear
    await page.waitForSelector('[data-testid="waitlist-form"]', {
      state: 'visible',
    })

    // Check for form elements
    const domainInput = page.locator('input[placeholder*="example.com"]')
    await expect(domainInput).toBeVisible()

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const submitButton = page.locator('button:has-text("Join Waitlist")')
    await expect(submitButton).toBeVisible()
  })

  test('should not show only icons without text', async ({ page }) => {
    // Take a screenshot
    const screenshot = await page.screenshot({ fullPage: true })

    // Check that we have actual text content visible
    const bodyText = await page.locator('body').innerText()

    // Should contain meaningful text, not just be empty or minimal
    expect(bodyText.length).toBeGreaterThan(500)
    expect(bodyText).toContain('Your website has untapped potential')
    expect(bodyText).toContain('Technical Performance')
    expect(bodyText).toContain('Security & Privacy')
    expect(bodyText).toContain('User Experience')

    // Check that the page isn't just showing icons
    // Count visible text elements
    const textElements = await page
      .locator('p, h1, h2, h3, h4, h5, h6, span')
      .count()
    expect(textElements).toBeGreaterThan(20) // Should have many text elements
  })

  test('should have proper layout structure', async ({ page }) => {
    // Check for main layout containers
    await expect(page.locator('main')).toBeVisible()

    // Check that sections are properly structured
    const sections = await page.locator('section').count()
    expect(sections).toBeGreaterThan(2) // Should have multiple sections

    // Check that content isn't hidden or collapsed
    const heroSection = page.locator('section').first()
    const heroBox = await heroSection.boundingBox()
    expect(heroBox?.height).toBeGreaterThan(100) // Hero should have substantial height
  })

  test.skip('visual regression - homepage should match expected layout', async ({
    page,
  }) => {
    // Wait for fonts and images to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for animations

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
    })
  })
})
