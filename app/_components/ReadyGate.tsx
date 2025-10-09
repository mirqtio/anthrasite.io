'use client'

import { useEffect } from 'react'

type Diag = {
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
 * Measure event-loop lag by scheduling microtasks and measuring delays
 * This helps detect if the main thread is blocked during hydration
 */
function observeEventLoopLag(ms = 3000) {
  const samples: number[] = []
  let running = true
  const start = performance.now()

  const tick = () => {
    if (!running) return
    const t = performance.now()
    samples.push(t)
    queueMicrotask(() => setTimeout(tick, 0))
    if (t - start > ms) running = false
  }

  setTimeout(tick, 0)

  return new Promise<{ p95: number; max: number }>((res) => {
    setTimeout(() => {
      const diffs: number[] = []
      for (let i = 1; i < samples.length; i++) {
        diffs.push(samples[i] - samples[i - 1])
      }
      diffs.sort((a, b) => a - b)
      const p95 = diffs[Math.floor(diffs.length * 0.95)] || 0
      const max = diffs[diffs.length - 1] || 0
      res({ p95, max })
    }, ms + 50)
  })
}

/**
 * ReadyGate component with comprehensive timing diagnostics
 *
 * Sets a reliable hydration signal after the browser is truly idle.
 * Waits for:
 * - DOMContentLoaded (sanity)
 * - Two rAFs (hydration flush + paint)
 * - requestIdleCallback (or 150ms fallback)
 *
 * Diagnostics exposed via window.__E2E_DIAG__:
 * - Precise timing at each step
 * - Event-loop lag metrics (p95, max)
 * - React event handler binding detection
 * - Performance marks for DevTools timeline
 *
 * Signals readiness via:
 * - data-hydrated="true" on <html>
 * - window.__APP_READY__ = true
 */
export default function ReadyGate() {
  useEffect(() => {
    const d: Diag = ((window as any).__E2E_DIAG__ =
      (window as any).__E2E_DIAG__ || {})
    d.t_navStart = performance.timeOrigin

    const setReady = async () => {
      d.t_ready = performance.now()

      // Measure event-loop lag over 1.5 seconds to detect blocking work
      const lag = await observeEventLoopLag(1500)
      d.lag_p95 = lag.p95
      d.lag_max = lag.max

      // Set readiness flags
      document.documentElement.setAttribute('data-hydrated', 'true')
      ;(window as any).__APP_READY__ = true

      // Add performance mark for DevTools timeline
      performance.mark('app-ready')

      // Detect if React has bound synthetic event handlers
      // React 18+ uses event delegation on the document root
      d.react_click_bound =
        !!(document as any).onclick || !!(document.body as any).onclick
    }

    const run = () => {
      const raf = (cb: FrameRequestCallback) => requestAnimationFrame(cb)
      const ridle =
        (window as any).requestIdleCallback ??
        ((cb: (deadline: unknown) => void) => setTimeout(() => cb({}), 150))

      d.t_domContent = performance.now()

      raf((t1) => {
        d.t_raf1 = t1
        raf((t2) => {
          d.t_raf2 = t2
          ridle(() => {
            d.t_idle = performance.now()
            setReady()
          })
        })
      })
    }

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', run, { once: true })
    } else {
      run()
    }
  }, [])

  return null
}
