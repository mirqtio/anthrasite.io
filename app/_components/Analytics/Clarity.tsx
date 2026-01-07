'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] }
  }
}

/**
 * Microsoft Clarity session replay for /landing/* routes only.
 * Bypasses consent system - relies on Privacy Policy disclosure.
 */
export function Clarity() {
  const pathname = usePathname()

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID

    // Only load on /landing/* routes in production with valid project ID
    if (!projectId) return
    if (process.env.NODE_ENV !== 'production') return
    if (!pathname?.startsWith('/landing')) return

    // Prevent duplicate script injection
    if (document.getElementById('clarity-script')) return

    try {
      // Initialize clarity queue function
      window.clarity =
        window.clarity ||
        function (...args: unknown[]) {
          ;(window.clarity!.q = window.clarity!.q || []).push(args)
        }

      // Create and inject script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.clarity.ms/tag/${projectId}`
      script.id = 'clarity-script'

      const firstScript = document.getElementsByTagName('script')[0]
      firstScript?.parentNode?.insertBefore(script, firstScript)
    } catch (error) {
      console.error('[Clarity] Failed to initialize:', error)
    }
  }, [pathname])

  return null
}
