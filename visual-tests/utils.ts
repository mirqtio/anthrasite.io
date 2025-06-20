import { Page, Locator, BrowserContext, expect, test } from '@playwright/test'

/**
 * Viewport presets for consistent testing
 */
export const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  desktop4k: { width: 3840, height: 2160 },
} as const

/**
 * Common animation and transition selectors to wait for
 */
const ANIMATION_SELECTORS = [
  '*[class*="transition"]',
  '*[class*="animate"]',
  '*[class*="motion"]',
  '.framer-motion',
  '[data-framer-motion]',
]

/**
 * Wait for all animations and transitions to complete
 */
export async function waitForAnimations(page: Page, timeout = 200) {
  try {
    // Wait for CSS animations and transitions with reduced timeout
    await page.waitForFunction(
      () => {
        const animations = document.getAnimations()
        return (
          animations.length === 0 ||
          animations.every((animation) => animation.playState === 'finished')
        )
      },
      { timeout: Math.min(timeout, 200) } // Cap at 200ms max for aggressive speed
    )
  } catch (error) {
    // If animations timeout, continue anyway - they might be infinite animations
    console.warn('Animation timeout reached, proceeding with test')
  }

  // Wait for any animation classes to stabilize
  for (const selector of ANIMATION_SELECTORS) {
    try {
      await page
        .waitForSelector(selector, {
          state: 'attached',
          timeout: 1000,
        })
        .catch(() => {})
    } catch {
      // Ignore if selector not found
    }
  }

  // Additional wait for any final renders
  await page.waitForTimeout(100)
}

/**
 * Wait for all images to load
 */
export async function waitForImages(page: Page, timeout = 1000) {
  try {
    await page.waitForFunction(
      () => {
        const images = Array.from(document.querySelectorAll('img'))
        if (images.length === 0) return true // No images to wait for

        return images.every((img) => {
          // Consider image loaded if it has completed loading OR has an error
          return img.complete || img.naturalHeight === 0
        })
      },
      { timeout }
    )
  } catch (error) {
    // If image loading times out, continue anyway for visual tests
    console.warn('Image loading timeout, continuing with screenshot')
  }
}

/**
 * Wait for all fonts to load
 */
export async function waitForFonts(page: Page, timeout = 500) {
  await page.waitForFunction(
    () => {
      return document.fonts.ready.then(() => true)
    },
    { timeout }
  )
}

/**
 * Hide dynamic content that changes between test runs
 */
export async function hideDynamicContent(page: Page) {
  try {
    await page.addStyleTag({
      content: `
      /* Hide timestamps and dates */
      [data-testid*="timestamp"],
      [data-testid*="date"],
      time,
      .timestamp,
      .date-time { 
        visibility: hidden !important; 
      }
      
      /* Hide loading spinners */
      [role="progressbar"],
      .spinner,
      .loading,
      [class*="skeleton"] {
        visibility: hidden !important;
      }
      
      /* Disable animations */
      *,
      *::before,
      *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      
      /* Hide cursors and selections */
      * {
        cursor: none !important;
        user-select: none !important;
      }
      
      /* Ensure consistent scrollbar rendering */
      ::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
      }
    `,
    })
  } catch (error) {
    // If page is closed or unavailable, continue gracefully
    console.warn(
      'Failed to hide dynamic content, continuing with test:',
      error instanceof Error ? error.message : String(error)
    )
  }
}

/**
 * Prepare page for screenshot by waiting for all content to load
 */
export async function preparePageForScreenshot(page: Page) {
  // Wait for network to be idle
  await page.waitForLoadState('networkidle')

  // Wait for all content to load with error handling
  await Promise.allSettled([
    waitForFonts(page).catch(() => console.warn('Font loading timeout')),
    waitForImages(page).catch(() => console.warn('Image loading timeout')),
    waitForAnimations(page).catch(() => console.warn('Animation timeout')),
  ])

  // Hide dynamic content
  await hideDynamicContent(page)

  // Scroll to top to ensure consistent positioning
  try {
    await page.evaluate(() => window.scrollTo(0, 0))
  } catch (error) {
    console.warn(
      'Failed to scroll to top, continuing:',
      error instanceof Error ? error.message : String(error)
    )
  }

  // Final stabilization wait
  await page.waitForTimeout(100) // Reduced for CI speed
}

/**
 * Take a screenshot with consistent settings
 */
export async function takeScreenshot(
  page: Page | Locator,
  name: string,
  options: {
    fullPage?: boolean
    clip?: { x: number; y: number; width: number; height: number }
    mask?: Locator[]
    maskColor?: string
    animations?: 'disabled' | 'allow'
    stylePath?: string
  } = {}
) {
  const {
    fullPage = true,
    clip,
    mask = [],
    maskColor = '#FF00FF',
    animations = 'disabled',
    stylePath,
  } = options

  // If it's a page, prepare it for screenshot
  if ('waitForLoadState' in page) {
    await preparePageForScreenshot(page as Page)
  }

  return await page.screenshot({
    fullPage,
    clip,
    mask,
    maskColor,
    animations,
  })
}

/**
 * Compare screenshots with custom settings
 */
export async function compareScreenshots(
  page: Page | Locator,
  name: string,
  options: {
    maxDiffPixels?: number
    maxDiffPixelRatio?: number
    threshold?: number
    fullPage?: boolean
    mask?: Locator[]
  } = {}
) {
  await expect(page).toHaveScreenshot(name, {
    maxDiffPixels: options.maxDiffPixels || 100,
    maxDiffPixelRatio: options.maxDiffPixelRatio || 0.01,
    threshold: options.threshold || 0.2,
    fullPage: options.fullPage !== false,
    mask: options.mask || [],
    animations: 'disabled',
  })
}

/**
 * Set consistent browser context for visual tests
 */
export async function setupVisualTestContext(context: BrowserContext) {
  // Set consistent timezone
  await context.addInitScript(() => {
    // Mock date to ensure consistent timestamps
    const constantDate = new Date('2025-01-01T12:00:00Z')
    const OriginalDate = Date
    // Use Object.defineProperty to avoid modifying global
    Object.defineProperty(window, 'Date', {
      configurable: true,
      writable: true,
      value: class extends OriginalDate {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(constantDate.getTime())
          } else {
            // @ts-expect-error - spreading arguments into parent constructor
            super(...args)
          }
        }

        static now() {
          return constantDate.getTime()
        }
      } as any,
    })
  })

  // Disable smooth scrolling
  await context.addInitScript(() => {
    window.scrollTo = ((xOrOptions: any, y?: number) => {
      if (typeof xOrOptions === 'object') {
        window.scrollX = xOrOptions.left || 0
        window.scrollY = xOrOptions.top || 0
      } else {
        window.scrollX = xOrOptions
        window.scrollY = y || 0
      }
    }) as any
  })
}

/**
 * Viewport test helper
 */
export async function testResponsiveViewports(
  page: Page,
  testFn: (viewport: keyof typeof VIEWPORTS) => Promise<void>
) {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(viewport)
    await testFn(name as keyof typeof VIEWPORTS)
  }
}

/**
 * Cross-browser test helper
 */
export function describeVisualTests(
  title: string,
  testFn: () => void,
  options: {
    browsers?: string[]
    skip?: string[]
  } = {}
) {
  const { browsers = ['chromium', 'firefox', 'webkit'], skip = [] } = options

  test.describe(title, () => {
    browsers.forEach((browser) => {
      if (!skip.includes(browser)) {
        test.describe(browser, () => {
          test.use({ browserName: browser as any })
          testFn()
        })
      }
    })
  })
}

// Re-export expect from Playwright
export { expect } from '@playwright/test'
