'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Hook that detects scroll-up gesture after user has dwelled on page.
 * Designed for mobile/touch devices where exit intent isn't available.
 *
 * @param dwellMs - Time in ms user must spend on page before detection activates. Default 10000.
 * @param scrollPx - Amount of upward scroll (in px) to trigger. Default 100.
 * @returns boolean indicating if scroll-up after dwell was detected
 */
export function useScrollUpAfterDwell(
  dwellMs = 10000,
  scrollPx = 100
): boolean {
  const [triggered, setTriggered] = useState(false)
  const [dwellComplete, setDwellComplete] = useState(false)
  const lastScrollY = useRef(0)
  const cumulativeUpScroll = useRef(0)

  // Start dwell timer on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      setDwellComplete(true)
    }, dwellMs)

    return () => clearTimeout(timer)
  }, [dwellMs])

  const handleScroll = useCallback(() => {
    if (triggered || !dwellComplete) return

    const currentY = window.scrollY

    // Detect upward scroll (negative delta)
    if (currentY < lastScrollY.current) {
      const scrollDelta = lastScrollY.current - currentY
      cumulativeUpScroll.current += scrollDelta

      // Trigger when enough upward scroll accumulated
      if (cumulativeUpScroll.current >= scrollPx) {
        setTriggered(true)
      }
    } else {
      // Reset cumulative counter on downward scroll
      cumulativeUpScroll.current = 0
    }

    lastScrollY.current = currentY
  }, [triggered, dwellComplete, scrollPx])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!dwellComplete) return

    // Initialize last scroll position
    lastScrollY.current = window.scrollY

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [dwellComplete, handleScroll])

  return triggered
}
