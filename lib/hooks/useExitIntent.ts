'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook that detects exit intent (cursor moving toward top of viewport).
 * Only triggers on desktop (pointer device with hover capability).
 *
 * @param threshold - Distance from top of viewport (in px) to trigger. Default 50.
 * @returns boolean indicating if exit intent was detected
 */
export function useExitIntent(threshold = 50): boolean {
  const [triggered, setTriggered] = useState(false)
  const cooldownRef = useRef(false)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Skip if already triggered or in cooldown
      if (triggered || cooldownRef.current) return

      // Only trigger when cursor is near top of viewport
      if (e.clientY < threshold) {
        setTriggered(true)
      }
    },
    [triggered, threshold]
  )

  useEffect(() => {
    // Only run on client with pointer device
    if (typeof window === 'undefined') return

    // Check if device has hover capability (desktop/laptop)
    const hasHover = window.matchMedia('(hover: hover)').matches
    if (!hasHover) return

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  return triggered
}
