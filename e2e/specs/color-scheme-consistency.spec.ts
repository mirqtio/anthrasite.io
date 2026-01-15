import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

/**
 * Color Scheme Consistency Test
 *
 * Verifies that all UIs render identically regardless of system
 * dark/light mode preference. Pages should NOT respond to
 * prefers-color-scheme media queries.
 *
 * Test methodology:
 * 1. Load each page with prefers-color-scheme: dark
 * 2. Take screenshot
 * 3. Load same page with prefers-color-scheme: light
 * 4. Take screenshot
 * 5. Compare screenshots using pixelmatch - they should be visually identical
 *
 * Note: We use pixelmatch instead of byte comparison because identical-looking
 * images can have different bytes due to PNG compression, anti-aliasing, etc.
 */

const PAGES_TO_TEST = [
  { name: 'Homepage', path: '/' },
  { name: 'Landing Page', path: '/landing/3093' },
  { name: 'Post Purchase', path: '/purchase-preview?utm=dev' },
  // Email Preview is a dev-only route (returns 404 in production)
  // Skip in production by checking BASE_URL
  ...(process.env.BASE_URL?.includes('anthrasite.io')
    ? []
    : [{ name: 'Email Preview', path: '/api/email/preview/report-ready' }]),
]

const TEST_RESULTS_DIR = 'test-results/color-scheme'

// Maximum allowed pixel difference percentage (0.1% = very strict)
// This accounts for minor anti-aliasing and font rendering differences
const MAX_DIFF_PERCENTAGE = 0.1

test.describe('Color Scheme Consistency', () => {
  test.beforeAll(async () => {
    // Ensure results directory exists
    fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true })
  })

  for (const pageConfig of PAGES_TO_TEST) {
    test(`${pageConfig.name} should look identical in dark and light mode`, async ({
      browser,
    }) => {
      // Create two browser contexts with different color schemes
      const darkContext = await browser.newContext({
        colorScheme: 'dark',
      })
      const lightContext = await browser.newContext({
        colorScheme: 'light',
      })

      const darkPage = await darkContext.newPage()
      const lightPage = await lightContext.newPage()

      // Set consistent viewport
      await darkPage.setViewportSize({ width: 1280, height: 800 })
      await lightPage.setViewportSize({ width: 1280, height: 800 })

      // Navigate to the page in both contexts
      const baseUrl = process.env.BASE_URL || 'http://localhost:3333'

      await Promise.all([
        darkPage.goto(`${baseUrl}${pageConfig.path}`, {
          waitUntil: 'networkidle',
        }),
        lightPage.goto(`${baseUrl}${pageConfig.path}`, {
          waitUntil: 'networkidle',
        }),
      ])

      // Wait for any animations to settle
      await Promise.all([
        darkPage.waitForTimeout(1000),
        lightPage.waitForTimeout(1000),
      ])

      // Generate filenames
      const safeName = pageConfig.name.toLowerCase().replace(/\s+/g, '-')
      const darkPath = path.join(TEST_RESULTS_DIR, `${safeName}-dark.png`)
      const lightPath = path.join(TEST_RESULTS_DIR, `${safeName}-light.png`)
      const diffPath = path.join(TEST_RESULTS_DIR, `${safeName}-diff.png`)

      // Take screenshots
      await darkPage.screenshot({ path: darkPath, fullPage: true })
      await lightPage.screenshot({ path: lightPath, fullPage: true })

      // Load images with pngjs for pixel comparison
      const darkImg = PNG.sync.read(fs.readFileSync(darkPath))
      const lightImg = PNG.sync.read(fs.readFileSync(lightPath))

      // Handle different image sizes (can happen with different page heights)
      const width = Math.max(darkImg.width, lightImg.width)
      const height = Math.max(darkImg.height, lightImg.height)

      // If images are different sizes, that's a significant difference
      const sameSize =
        darkImg.width === lightImg.width && darkImg.height === lightImg.height

      let diffPixels = 0
      let diffPercentage = 0

      if (sameSize) {
        // Create diff image
        const diff = new PNG({ width, height })

        // Compare pixels with pixelmatch
        diffPixels = pixelmatch(
          darkImg.data,
          lightImg.data,
          diff.data,
          width,
          height,
          { threshold: 0.1 } // Color threshold (0 = exact, 1 = any)
        )

        const totalPixels = width * height
        diffPercentage = (diffPixels / totalPixels) * 100

        // Save diff image if there are differences
        if (diffPixels > 0) {
          fs.writeFileSync(diffPath, PNG.sync.write(diff))
        }
      } else {
        // Different sizes = 100% different
        diffPercentage = 100
        diffPixels = width * height
      }

      const passed = diffPercentage <= MAX_DIFF_PERCENTAGE

      if (!passed) {
        console.log(`\n${'='.repeat(60)}`)
        console.log(`FAILURE: ${pageConfig.name}`)
        console.log(`${'='.repeat(60)}`)
        console.log(
          `Pixel difference: ${diffPixels} pixels (${diffPercentage.toFixed(4)}%)`
        )
        console.log(`Threshold: ${MAX_DIFF_PERCENTAGE}%`)
        if (!sameSize) {
          console.log(
            `Image sizes differ: dark=${darkImg.width}x${darkImg.height}, light=${lightImg.width}x${lightImg.height}`
          )
        }
        console.log(`Dark mode screenshot: ${darkPath}`)
        console.log(`Light mode screenshot: ${lightPath}`)
        if (sameSize && diffPixels > 0) {
          console.log(`Diff image: ${diffPath}`)
        }
        console.log(`\nTo investigate:`)
        console.log(`  1. Open both screenshots and compare visually`)
        console.log(`  2. Check for prefers-color-scheme CSS rules`)
        console.log(`  3. Look for elements that change based on system theme`)
        console.log(`${'='.repeat(60)}\n`)
      } else {
        console.log(
          `✓ ${pageConfig.name}: ${diffPercentage.toFixed(4)}% difference (within ${MAX_DIFF_PERCENTAGE}% threshold)`
        )
      }

      expect(
        passed,
        `${pageConfig.name} renders differently in dark vs light mode. ` +
          `${diffPixels} pixels differ (${diffPercentage.toFixed(4)}%). ` +
          `Compare: ${darkPath} and ${lightPath}`
      ).toBe(true)

      // Cleanup
      await darkContext.close()
      await lightContext.close()
    })
  }
})

// CSS rule check - faster test that catches obvious issues
test.describe('Color Scheme CSS Audit', () => {
  for (const pageConfig of PAGES_TO_TEST) {
    test(`${pageConfig.name} should not have prefers-color-scheme CSS rules`, async ({
      browser,
    }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      const baseUrl = process.env.BASE_URL || 'http://localhost:3333'
      await page.goto(`${baseUrl}${pageConfig.path}`, {
        waitUntil: 'networkidle',
      })

      // Check for prefers-color-scheme media queries in stylesheets
      const colorSchemeRules = await page.evaluate(() => {
        const rules: Array<{ condition: string; cssText: string }> = []

        for (const sheet of Array.from(document.styleSheets)) {
          try {
            for (const rule of Array.from(sheet.cssRules || [])) {
              const mediaRule = rule as CSSMediaRule
              if (mediaRule.conditionText?.includes('prefers-color-scheme')) {
                rules.push({
                  condition: mediaRule.conditionText,
                  cssText: mediaRule.cssText.substring(0, 300),
                })
              }
            }
          } catch (e) {
            // Cross-origin stylesheet, skip
          }
        }

        return rules
      })

      if (colorSchemeRules.length > 0) {
        console.log(`\n${'='.repeat(60)}`)
        console.log(
          `WARNING: ${pageConfig.name} has prefers-color-scheme rules`
        )
        console.log(`${'='.repeat(60)}`)
        colorSchemeRules.forEach((rule, i) => {
          console.log(`Rule ${i + 1}: ${rule.condition}`)
          console.log(`  ${rule.cssText}`)
        })
        console.log(`${'='.repeat(60)}\n`)
      }

      expect(
        colorSchemeRules,
        `Found ${colorSchemeRules.length} prefers-color-scheme rules that may cause inconsistent rendering`
      ).toHaveLength(0)

      await context.close()
    })
  }
})
