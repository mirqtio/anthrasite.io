import type { Page, Locator } from '@playwright/test'

/**
 * Debug helper to capture computed styles and layout info
 * Use this to understand why Playwright considers an element invisible
 */
export async function debugElementVisibility(
  page: Page,
  locator: Locator,
  label = 'Element'
) {
  const el = await locator.elementHandle()
  if (!el) {
    console.log(`[${label}] ❌ No elementHandle`)
    return
  }

  const info = await el.evaluate((n) => {
    const cs = getComputedStyle(n)
    const r = n.getBoundingClientRect()
    return {
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      pointerEvents: cs.pointerEvents,
      zIndex: cs.zIndex,
      transform: cs.transform,
      position: cs.position,
      overflow: cs.overflow,
      height: cs.height,
      width: cs.width,
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      ariaHidden: n.getAttribute('aria-hidden'),
      hiddenAttr: n.hasAttribute('hidden'),
      parentTransform: n.parentElement
        ? getComputedStyle(n.parentElement).transform
        : null,
      parentOpacity: n.parentElement
        ? getComputedStyle(n.parentElement).opacity
        : null,
    }
  })

  console.log(
    `[${label}] Computed Styles & Layout:`,
    JSON.stringify(info, null, 2)
  )
  return info
}
