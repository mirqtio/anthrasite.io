import { Page } from '@playwright/test'

/**
 * Check for elements with pointer-events: none that might block clicks
 * These can cause "not clickable at point" errors in Playwright
 *
 * @param page - Playwright page
 */
export async function assertNoBlockingOverlay(page: Page) {
  const result = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('*'))
    const blockers = allElements.filter((el) => {
      const style = window.getComputedStyle(el as HTMLElement)
      const hasPointerNone = style.pointerEvents === 'none'
      const coversScreen =
        (el as HTMLElement).offsetWidth > window.innerWidth * 0.5 &&
        (el as HTMLElement).offsetHeight > window.innerHeight * 0.5
      const isOverlay = el.matches(
        '[class*="overlay"],[class*="modal"],[data-overlay],[role="dialog"]'
      )

      return hasPointerNone && (coversScreen || isOverlay)
    })

    return {
      count: blockers.length,
      elements: blockers.slice(0, 3).map((el) => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
        role: el.getAttribute('role'),
        zIndex: window.getComputedStyle(el as HTMLElement).zIndex,
      })),
    }
  })

  if (result.count > 0) {
    console.warn(
      `OVERLAY_BLOCKERS: Found ${result.count} blocking elements with pointer-events: none`,
      result.elements
    )
  } else {
    console.log('OVERLAY_BLOCKERS: None detected ✅')
  }

  return result.count
}

/**
 * Wait for any blocking overlays to clear before proceeding
 * Useful before critical clicks
 */
export async function waitForNoBlockingOverlay(
  page: Page,
  timeout = 5000
): Promise<void> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const count = await assertNoBlockingOverlay(page)
    if (count === 0) {
      return
    }
    await page.waitForTimeout(100)
  }

  console.warn(`OVERLAY_BLOCKERS: Still present after ${timeout}ms timeout`)
}
