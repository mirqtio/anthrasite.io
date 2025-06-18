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

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  
  // Initialize monitoring services
  useEffect(() => {
    initMonitoring()
    setMounted(true)
  }, [])
  
  // Don't track anything during SSR
  if (!mounted) {
    return <>{children}</>
  }
  
  return <MonitoringProviderInner>{children}</MonitoringProviderInner>
}