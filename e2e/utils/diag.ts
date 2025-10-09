import { Page } from '@playwright/test'

/**
 * Diagnostic data structure from ReadyGate instrumentation
 */
export type E2EDiag = {
  t_navStart?: number
  t_domContent?: number
  t_raf1?: number
  t_raf2?: number
  t_idle?: number
  t_ready?: number
  lag_p95?: number
  lag_max?: number
  react_click_bound?: boolean
}

/**
 * Dump diagnostic timing data from the page
 * This shows exactly when each step of hydration completed
 * and whether React event handlers are bound
 *
 * @param page - Playwright page
 * @param label - Test identifier for logging
 */
export async function dumpDiag(page: Page, label: string) {
  const diag = await page.evaluate(
    () => (window as any).__E2E_DIAG__ as E2EDiag | undefined
  )

  if (!diag) {
    console.log(`E2E_DIAG[${label}]: No diagnostic data available`)
    return
  }

  // Calculate deltas for easier analysis
  const deltas = {
    dom_to_raf1:
      diag.t_raf1 && diag.t_domContent
        ? diag.t_raf1 - diag.t_domContent
        : undefined,
    raf1_to_raf2:
      diag.t_raf2 && diag.t_raf1 ? diag.t_raf2 - diag.t_raf1 : undefined,
    raf2_to_idle:
      diag.t_idle && diag.t_raf2 ? diag.t_idle - diag.t_raf2 : undefined,
    idle_to_ready:
      diag.t_ready && diag.t_idle ? diag.t_ready - diag.t_idle : undefined,
    total_hydration:
      diag.t_ready && diag.t_domContent
        ? diag.t_ready - diag.t_domContent
        : undefined,
  }

  console.log(
    `E2E_DIAG[${label}]: ${JSON.stringify(
      {
        ...diag,
        deltas,
      },
      null,
      2
    )}`
  )
}

/**
 * Assert diagnostic data meets expectations
 * Useful for debugging timing issues
 */
export async function assertDiagHealth(page: Page, label: string) {
  const diag = await page.evaluate(
    () => (window as any).__E2E_DIAG__ as E2EDiag | undefined
  )

  if (!diag) {
    console.warn(
      `E2E_DIAG[${label}]: ⚠️  No diagnostic data - ReadyGate may not have run`
    )
    return
  }

  const issues: string[] = []

  // Check if hydration completed
  if (!diag.t_ready) {
    issues.push('Hydration never completed (t_ready missing)')
  }

  // Check for excessive event-loop lag
  if (diag.lag_p95 && diag.lag_p95 > 50) {
    issues.push(`High event-loop lag p95: ${diag.lag_p95}ms (should be <50ms)`)
  }
  if (diag.lag_max && diag.lag_max > 200) {
    issues.push(
      `Very high event-loop lag max: ${diag.lag_max}ms (should be <200ms)`
    )
  }

  // Check if React handlers are bound
  if (diag.react_click_bound === false) {
    issues.push('React click handlers NOT bound (event delegation missing)')
  }

  if (issues.length > 0) {
    console.warn(
      `E2E_DIAG[${label}]: ⚠️  Issues detected:\n  - ${issues.join('\n  - ')}`
    )
  } else {
    console.log(`E2E_DIAG[${label}]: ✅ All health checks passed`)
  }
}
