'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollTriggerProps {
  onLoadMore: () => void
  isLoading?: boolean
  hasMore?: boolean
}

export function InfiniteScrollTrigger({
  onLoadMore,
  isLoading,
  hasMore = true,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (triggerRef.current) {
      observer.observe(triggerRef.current)
    }

    return () => observer.disconnect()
  }, [onLoadMore, isLoading, hasMore])

  if (!hasMore) return null

  return (
    <div ref={triggerRef} className="flex justify-center py-8 w-full">
      {isLoading ? (
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading more leads...
        </div>
      ) : (
        <div className="h-4" /> // Invisible trigger area
      )}
    </div>
  )
}
