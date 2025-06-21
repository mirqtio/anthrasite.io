'use client'

import { useEffect, useState } from 'react'
import { initMonitoring } from '@/lib/monitoring'
import { usePageTracking, usePerformanceObserver } from '@/lib/monitoring/hooks'

function MonitoringProviderInner({ children }: { children: React.ReactNode }) {
  // Track page views
  usePageTracking()

  // Monitor performance metrics
  usePerformanceObserver()

  return <>{children}</>
}

export function MonitoringProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  // Initialize monitoring services
  useEffect(() => {
    const init = async () => {
      try {
        // Skip monitoring in test environment
        if (process.env.NODE_ENV !== 'test') {
          await initMonitoring()
        }
      } catch (error) {
        console.error('Failed to initialize monitoring:', error)
      }
      setMounted(true)
    }
    init()
  }, [])

  // Don't track anything during SSR
  if (!mounted) {
    return <>{children}</>
  }

  return <MonitoringProviderInner>{children}</MonitoringProviderInner>
}
