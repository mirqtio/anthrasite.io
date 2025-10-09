'use client'

import { useEffect } from 'react'

/**
 * HydrationFlag component
 *
 * Sets a data attribute on the <html> element when React hydration completes.
 * This allows E2E tests to wait for the app to become fully interactive
 * before performing assertions or interactions.
 *
 * In production builds, hydration can take longer due to:
 * - Code splitting and chunk loading
 * - Larger bundle sizes
 * - Server-side rendering optimizations
 *
 * This flag provides a reliable signal that the app is ready for interaction.
 */
export function HydrationFlag() {
  useEffect(() => {
    // Signal to E2E tests that React hydration has completed
    document.documentElement.setAttribute('data-hydrated', 'true')

    // Cleanup on unmount (though this component should never unmount)
    return () => {
      document.documentElement.removeAttribute('data-hydrated')
    }
  }, [])

  // This component renders nothing
  return null
}
