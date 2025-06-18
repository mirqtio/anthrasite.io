import { test, expect } from '@playwright/test'

test.describe('Homepage Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for content to load by waiting for the main element to be visible
    await page.waitForSelector('main', { state: 'visible', timeout: 10000 })
  })

  test('should render hero section with correct content', async ({ page }) => {
    // Check for main headline
    const headline = page.locator('h1')
    await expect(headline).toBeVisible()
    await expect(headline).toHaveText('Automated Website Audits That Uncover Untapped Potential')
    
    // Check for subheadline
    const subheadline = page.locator('text=Anthrasite analyzes your website across 50+ critical factors')
    await expect(subheadline).toBeVisible()
    
    // Check for CTAs
    await expect(page.locator('button:has-text("Join Waitlist")')).toBeVisible()
    await expect(page.locator('a:has-text("Learn more")')).toBeVisible()
  })

  test('should render features section', async ({ page }) => {
    // Check for section title
    await expect(page.locator('h2:has-text("Comprehensive Website Analysis")')).toBeVisible()
    
    // Check for feature cards
    await expect(page.locator('text=Performance Analysis')).toBeVisible()
    await expect(page.locator('text=Security Audit')).toBeVisible()
    await expect(page.locator('text=SEO Assessment')).toBeVisible()
    
    // Check that feature descriptions are visible
    await expect(page.locator('text=Core Web Vitals')).toBeVisible()
    await expect(page.locator('text=SSL configuration')).toBeVisible()
    await expect(page.locator('text=Meta tags')).toBeVisible()
  })

  test('should render waitlist form section', async ({ page }) => {
    // Scroll to form
    await page.locator('form').scrollIntoViewIfNeeded()
    
    // Check for form heading
    await expect(page.locator('text=Ready to unlock your website\'s potential?')).toBeVisible()
    
    // Check for form elements
    const domainInput = page.locator('input[placeholder*="example.com"]')
    await expect(domainInput).toBeVisible()
    
    const submitButton = page.locator('button:has-text("Continue")')
    await expect(submitButton).toBeVisible()
  })

  test('should not show only icons without text', async ({ page }) => {
    // Take a screenshot
    const screenshot = await page.screenshot({ fullPage: true })
    
    // Check that we have actual text content visible
    const bodyText = await page.locator('body').innerText()
    
    // Should contain meaningful text, not just be empty or minimal
    expect(bodyText.length).toBeGreaterThan(500)
    expect(bodyText).toContain('Automated Website Audits')
    expect(bodyText).toContain('Performance Analysis')
    expect(bodyText).toContain('Security Audit')
    expect(bodyText).toContain('SEO Assessment')
    
    // Check that the page isn't just showing icons
    // Count visible text elements
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6, span').count()
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

  test.skip('visual regression - homepage should match expected layout', async ({ page }) => {
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