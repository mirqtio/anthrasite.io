import { test, expect } from '@playwright/test'
import { gotoAndDismissCookies } from './helpers/test-utils'

test.describe('CSS Loading and Styling', () => {
  test('should load Tailwind CSS properly', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Wait for stylesheets to load
    await page.waitForLoadState('networkidle')

    // Check that CSS file is loaded
    const stylesheets = await page.evaluate(() => {
      return Array.from(document.styleSheets).map((sheet) => ({
        href: sheet.href,
        rules: sheet.cssRules ? sheet.cssRules.length : 0,
      }))
    })

    expect(stylesheets.length).toBeGreaterThan(0)
    expect(stylesheets[0].rules).toBeGreaterThan(100) // Should have many CSS rules
  })

  test('should apply Tailwind utility classes', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Check h1 has proper text size (text-4xl should be 2.25rem = 36px, sm:text-6xl should be 3.75rem = 60px)
    const h1 = page.locator('h1').first()
    const h1FontSize = await h1.evaluate(
      (el) => window.getComputedStyle(el).fontSize
    )
    const h1FontSizePx = parseFloat(h1FontSize)

    // Should be at least 36px (text-4xl)
    expect(h1FontSizePx).toBeGreaterThanOrEqual(36)
  })

  test('should constrain SVG icon sizes', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Wait for features section to be visible
    await page.locator('text=Core Web Vitals').waitFor()

    // Check that SVG icons are properly sized (should be h-6 w-6 = 24px)
    const svgIcons = page
      .locator('section')
      .filter({ hasText: 'Core Web Vitals' })
      .locator('svg')
    const iconCount = await svgIcons.count()

    expect(iconCount).toBeGreaterThan(0)

    // Check first icon size
    const firstIcon = svgIcons.first()
    const iconSize = await firstIcon.evaluate((el) => ({
      width: window.getComputedStyle(el).width,
      height: window.getComputedStyle(el).height,
    }))

    const widthPx = parseFloat(iconSize.width)
    const heightPx = parseFloat(iconSize.height)

    // Icons should be 24px (h-6 w-6)
    expect(widthPx).toBeLessThanOrEqual(50) // Definitely not 1262px!
    expect(heightPx).toBeLessThanOrEqual(50)
  })

  test('should apply background colors', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Check body background is white
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor
    })
    expect(bodyBg).toBe('rgb(255, 255, 255)')

    // Check if any section has gray background (bg-anthracite-gray-50)
    const graySection = page.locator('section.bg-anthracite-gray-50')
    const sectionCount = await graySection.count()

    if (sectionCount > 0) {
      const sectionBg = await graySection
        .first()
        .evaluate((el) => window.getComputedStyle(el).backgroundColor)
      // Should be a light gray, not white
      expect(sectionBg).not.toBe('rgb(255, 255, 255)')
    }
  })

  test('should apply proper spacing and layout', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Check container has max-width and margins
    const container = page.locator('.container').first()
    const containerStyles = await container.evaluate((el) => ({
      maxWidth: window.getComputedStyle(el).maxWidth,
      marginLeft: window.getComputedStyle(el).marginLeft,
      marginRight: window.getComputedStyle(el).marginRight,
    }))

    // Container should have max-width set
    expect(containerStyles.maxWidth).not.toBe('none')

    // Should have auto margins for centering
    expect(containerStyles.marginLeft).toBe('auto')
    expect(containerStyles.marginRight).toBe('auto')
  })

  test('should not show unstyled content', async ({ page }) => {
    await gotoAndDismissCookies(page, '/')

    // Take a screenshot
    const screenshot = await page.screenshot({ fullPage: true })

    // The page should not be just black text on white
    // Check that we have proper styling by looking for:
    // 1. Properly sized text (not all same size)
    // 2. Icons that aren't huge
    // 3. Some color variation

    const pageAnalysis = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*')
      const fontSizes = new Set()
      const colors = new Set()

      allElements.forEach((el) => {
        const styles = window.getComputedStyle(el)
        if (styles.fontSize) fontSizes.add(styles.fontSize)
        if (styles.color) colors.add(styles.color)
      })

      return {
        uniqueFontSizes: fontSizes.size,
        uniqueColors: colors.size,
      }
    })

    // Should have multiple font sizes (not just browser defaults)
    expect(pageAnalysis.uniqueFontSizes).toBeGreaterThan(5)

    // Should have multiple colors
    expect(pageAnalysis.uniqueColors).toBeGreaterThan(3)
  })
})
