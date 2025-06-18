import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { trackEvent, startTransaction } from './index'

// Track page views
export const usePageTracking = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const previousPath = useRef<string | undefined>(undefined)

  useEffect(() => {
    const currentPath = pathname + (searchParams ? `?${searchParams}` : '')

    if (previousPath.current !== currentPath) {
      trackEvent('page_view', {
        path: pathname,
        search: searchParams?.toString(),
        referrer: previousPath.current,
      })

      previousPath.current = currentPath
    }
  }, [pathname, searchParams])
}

// Track component render performance
export const useRenderTracking = (componentName: string) => {
  const renderCount = useRef(0)
  const mountTime = useRef(Date.now())

  useEffect(() => {
    renderCount.current++

    // Track excessive re-renders
    if (renderCount.current > 10) {
      trackEvent('performance.excessive_renders', {
        component: componentName,
        count: renderCount.current,
        duration: Date.now() - mountTime.current,
      })
    }
  })

  useEffect(() => {
    return () => {
      // Track component lifecycle
      trackEvent('component.unmount', {
        component: componentName,
        renders: renderCount.current,
        lifetime: Date.now() - mountTime.current,
      })
    }
  }, [componentName])
}

// Track user interactions
export const useInteractionTracking = (interactionName: string) => {
  return (metadata?: Record<string, any>) => {
    trackEvent(`interaction.${interactionName}`, {
      timestamp: Date.now(),
      ...metadata,
    })
  }
}

// Track API call performance
export const useApiTracking = () => {
  const track = async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const transaction = startTransaction(`api.${apiName}`, 'http.client')

    try {
      const startTime = performance.now()
      const result = await apiCall()
      const duration = performance.now() - startTime

      // Track the performance manually
      trackEvent(`api_performance.${apiName}`, { duration })

      transaction.setStatus('ok')
      return result
    } catch (error) {
      transaction.setStatus('internal_error')
      throw error
    } finally {
      transaction.finish()
    }
  }

  return { track }
}

// Track form interactions
export const useFormTracking = (formName: string) => {
  const startTime = useRef<number | undefined>(undefined)

  const trackStart = () => {
    startTime.current = Date.now()
    trackEvent('form.started', { form: formName })
  }

  const trackField = (fieldName: string, isValid: boolean) => {
    trackEvent('form.field_interaction', {
      form: formName,
      field: fieldName,
      valid: isValid,
    })
  }

  const trackSubmit = (success: boolean, errors?: string[]) => {
    const duration = startTime.current ? Date.now() - startTime.current : 0

    trackEvent(success ? 'form.submitted' : 'form.error', {
      form: formName,
      duration,
      errors,
    })
  }

  const trackAbandon = () => {
    const duration = startTime.current ? Date.now() - startTime.current : 0

    trackEvent('form.abandoned', {
      form: formName,
      duration,
    })
  }

  return {
    trackStart,
    trackField,
    trackSubmit,
    trackAbandon,
  }
}

// Track purchase funnel
export const usePurchaseFunnelTracking = () => {
  const trackStep = (step: string, metadata?: Record<string, any>) => {
    trackEvent('funnel.purchase_step', {
      step,
      timestamp: Date.now(),
      ...metadata,
    })
  }

  const trackConversion = (amount: number, currency: string = 'USD') => {
    trackEvent('funnel.purchase_completed', {
      amount,
      currency,
      timestamp: Date.now(),
    })
  }

  const trackAbandonment = (step: string, reason?: string) => {
    trackEvent('funnel.abandoned', {
      step,
      reason,
      timestamp: Date.now(),
    })
  }

  return {
    trackStep,
    trackConversion,
    trackAbandonment,
  }
}

// Performance observer hook
export const usePerformanceObserver = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return
    }

    // Observe Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]

      trackEvent('performance.lcp', {
        value: lastEntry.startTime,
        element: (lastEntry as any).element?.tagName,
      })
    })

    // Observe First Input Delay
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        trackEvent('performance.fid', {
          value: (entry as any).processingStart - entry.startTime,
          name: entry.name,
        })
      })
    })

    // Observe Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      let cls = 0

      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value
        }
      })

      trackEvent('performance.cls', {
        value: cls,
      })
    })

    try {
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      fidObserver.observe({ type: 'first-input', buffered: true })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {
      // Some browsers don't support all performance entry types
    }

    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])
}
