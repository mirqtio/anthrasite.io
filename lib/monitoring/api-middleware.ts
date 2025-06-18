import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { sendAlert, AlertType } from './index'

export interface ApiMonitoringOptions {
  trackPerformance?: boolean
  alertOnError?: boolean
  alertThreshold?: number // milliseconds
}

export function withMonitoring(
  handler: (req: any) => Promise<any>,
  routeName: string,
  options: ApiMonitoringOptions = {}
) {
  const {
    trackPerformance = true,
    alertOnError = true,
    alertThreshold = 5000,
  } = options
  
  return async (req: any) => {
    const transaction = trackPerformance
      ? {
          setHttpStatus: (status: number) => {},
          setData: (key: string, value: any) => {},
          finish: () => {},
        }
      : null
    
    const startTime = Date.now()
    const method = req.method
    const url = req.url
    
    try {
      // Add request metadata to Sentry
      const headersObj = req.headers instanceof Map
        ? Object.fromEntries(req.headers.entries())
        : req.headers || {}
      
      Sentry.setContext('request', {
        method,
        url,
        headers: headersObj,
        route: routeName,
      })
      
      // Execute the handler
      const response = await handler(req)
      const duration = Date.now() - startTime
      
      // Track slow APIs
      if (duration > alertThreshold) {
        sendAlert(AlertType.EXTERNAL_API_FAILED, {
          route: routeName,
          method,
          duration,
          threshold: alertThreshold,
          type: 'slow_response',
        })
      }
      
      // Set transaction status
      if (transaction) {
        transaction.setHttpStatus(response.status)
        transaction.setData('response_time', duration)
        transaction.finish()
      }
      
      // Add monitoring headers
      const headers = response.headers instanceof Map 
        ? response.headers 
        : new Map(Object.entries(response.headers || {}))
      headers.set('X-Response-Time', duration.toString())
      headers.set('X-Route-Name', routeName)
      
      // Handle both test and real NextResponse
      if (typeof NextResponse !== 'undefined') {
        return new NextResponse(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: new Headers(headers),
        })
      }
      
      // For tests
      return {
        ...response,
        headers,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      
      // Capture error in Sentry
      Sentry.captureException(error, {
        tags: {
          route: routeName,
          method,
        },
        contexts: {
          api: {
            duration,
            url,
          },
        },
      })
      
      // Send alert for critical routes
      if (alertOnError) {
        sendAlert(AlertType.EXTERNAL_API_FAILED, {
          route: routeName,
          method,
          error: (error as Error).message,
          duration,
        })
      }
      
      // Finish transaction with error status
      if (transaction) {
        transaction.setHttpStatus(500)
        transaction.setData('error', true)
        transaction.finish()
      }
      
      // Re-throw to let Next.js handle the error response
      throw error
    }
  }
}

// Database monitoring wrapper
export function withDbMonitoring<T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  queryName: string
): T {
  return (async (...args: Parameters<T>) => {
    
    const startTime = Date.now()
    
    try {
      const result = await queryFn(...args)
      
      // Log slow queries
      const duration = Date.now() - startTime
      if (duration > 1000) {
        Sentry.addBreadcrumb({
          category: 'database',
          message: `Slow query: ${queryName}`,
          level: 'warning',
          data: { duration },
        })
      }
      
      return result
    } catch (error) {
      
      // Send alert for database errors
      sendAlert(AlertType.DATABASE_CONNECTION_FAILED, {
        query: queryName,
        error: (error as Error).message,
        duration: Date.now() - startTime,
      })
      
      throw error
    }
  }) as T
}

// External API monitoring wrapper
export async function monitorExternalApi<T>(
  apiName: string,
  apiCall: () => Promise<T>,
  options: {
    timeout?: number
    retries?: number
    alertOnFailure?: boolean
  } = {}
): Promise<T> {
  const { timeout = 10000, retries = 3, alertOnFailure = true } = options
  
  let lastError: Error | null = null
  let attempt = 0
  
  while (attempt < retries) {
    
    const startTime = Date.now()
    
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`API timeout: ${apiName}`)), timeout)
      })
      
      // Race between API call and timeout
      const result = await Promise.race([apiCall(), timeoutPromise])
      
      return result
    } catch (error) {
      lastError = error as Error
      attempt++
      
      // Log the retry attempt
      Sentry.addBreadcrumb({
        category: 'external_api',
        message: `API retry: ${apiName}`,
        level: 'warning',
        data: {
          attempt,
          error: lastError.message,
        },
      })
      
      // Exponential backoff for retries
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  // All retries failed
  if (alertOnFailure && lastError) {
    sendAlert(AlertType.EXTERNAL_API_FAILED, {
      api: apiName,
      error: lastError.message,
      attempts: attempt,
    })
  }
  
  throw lastError || new Error(`API failed: ${apiName}`)
}