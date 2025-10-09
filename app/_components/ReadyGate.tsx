'use client'

import { useEffect } from 'react'

/**
 * ReadyGate component
 *
 * Sets a reliable hydration signal after the browser is truly idle.
 * Waits for:
 * - DOMContentLoaded (sanity)
 * - Two rAFs (hydration flush + paint)
 * - requestIdleCallback (or 100ms fallback)
 *
 * This eliminates race conditions where tests check for readiness
 * before React has fully hydrated the app in production builds.
 *
 * Signals readiness via:
 * - data-hydrated="true" on <html>
 * - window.__APP_READY__ = true
 */
export default function ReadyGate() {
  useEffect(() => {
    const setReady = () => {
      document.documentElement.setAttribute('data-hydrated', 'true')
      ;(window as any).__APP_READY__ = true
    }

    const raf = (cb: FrameRequestCallback) => requestAnimationFrame(cb)
    const ridle =
      (window as any).requestIdleCallback ??
      ((cb: (deadline: unknown) => void) => setTimeout(() => cb({}), 100))

    const run = () => {
      // Wait a tick -> paint -> idle
      Promise.resolve().then(() => {
        raf(() => {
          raf(() => {
            ridle(() => setReady())
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
