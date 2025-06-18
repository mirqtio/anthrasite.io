/**
 * @jest-environment node
 */

// Mock NextResponse before importing modules that use it
jest.mock('next/server', () => ({
  NextResponse: undefined,
  NextRequest: jest.fn(),
}))

import {
  withMonitoring,
  withDbMonitoring,
  monitorExternalApi,
} from '../api-middleware'
import * as Sentry from '@sentry/nextjs'
import { sendAlert, AlertType } from '../index'

// Mock Next.js server components
const mockNextRequest = (url: string, method: string = 'GET') => ({
  url,
  method,
  headers: new Map([['content-type', 'application/json']]),
})

const mockNextResponse = (body: string, init?: ResponseInit) => ({
  body,
  status: init?.status || 200,
  headers: new Map(Object.entries(init?.headers || {})),
})

// Mock dependencies
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setContext: jest.fn(),
  startTransaction: jest.fn(() => ({
    setHttpStatus: jest.fn(),
    setData: jest.fn(),
    finish: jest.fn(),
  })),
  getCurrentHub: jest.fn(() => ({
    getScope: jest.fn(() => ({
      getSpan: jest.fn(() => ({
        startChild: jest.fn(() => ({
          setStatus: jest.fn(),
          setData: jest.fn(),
          finish: jest.fn(),
        })),
      })),
    })),
  })),
}))
jest.mock('../index', () => ({
  sendAlert: jest.fn(),
  AlertType: {
    EXTERNAL_API_FAILED: 'external.api.failed',
    DATABASE_CONNECTION_FAILED: 'database.connection.failed',
  },
}))

describe('API Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('withMonitoring', () => {
    it('should monitor successful API calls', async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(mockNextResponse('OK', { status: 200 }))

      const monitoredHandler = withMonitoring(mockHandler, 'test_route')
      const mockRequest = mockNextRequest('http://localhost/api/test')

      const response = await monitoredHandler(mockRequest as any)

      expect(response.status).toBe(200)
      expect(response.headers.get('X-Route-Name')).toBe('test_route')
      expect(response.headers.get('X-Response-Time')).toBeDefined()
    })

    it('should capture errors and send alerts', async () => {
      const error = new Error('Handler failed')
      const mockHandler = jest.fn().mockRejectedValue(error)

      const monitoredHandler = withMonitoring(mockHandler, 'test_route', {
        alertOnError: true,
      })
      const mockRequest = mockNextRequest('http://localhost/api/test')

      await expect(monitoredHandler(mockRequest as any)).rejects.toThrow(error)

      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: {
            route: 'test_route',
            method: 'GET',
          },
        })
      )

      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.EXTERNAL_API_FAILED,
        expect.objectContaining({
          route: 'test_route',
          error: 'Handler failed',
        })
      )
    })

    it('should alert on slow responses', async () => {
      const mockHandler = jest.fn().mockImplementation(async () => {
        // Simulate slow response
        await new Promise((resolve) => setTimeout(resolve, 100))
        return mockNextResponse('OK')
      })

      const monitoredHandler = withMonitoring(mockHandler, 'test_route', {
        alertThreshold: 50, // 50ms threshold
      })
      const mockRequest = mockNextRequest('http://localhost/api/test')

      await monitoredHandler(mockRequest as any)

      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.EXTERNAL_API_FAILED,
        expect.objectContaining({
          route: 'test_route',
          type: 'slow_response',
        })
      )
    })
  })

  describe('withDbMonitoring', () => {
    it('should monitor successful database queries', async () => {
      const mockQuery = jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
      const monitoredQuery = withDbMonitoring(mockQuery, 'test_query')

      const result = await monitoredQuery('arg1', 'arg2')

      expect(result).toEqual({ id: 1, name: 'Test' })
      expect(mockQuery).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should alert on database errors', async () => {
      const error = new Error('Database connection failed')
      const mockQuery = jest.fn().mockRejectedValue(error)
      const monitoredQuery = withDbMonitoring(mockQuery, 'test_query')

      await expect(monitoredQuery()).rejects.toThrow(error)

      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.DATABASE_CONNECTION_FAILED,
        expect.objectContaining({
          query: 'test_query',
          error: 'Database connection failed',
        })
      )
    })
  })

  describe('monitorExternalApi', () => {
    it('should handle successful API calls', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({ data: 'test' })

      const result = await monitorExternalApi('test_api', mockApiCall)

      expect(result).toEqual({ data: 'test' })
      expect(mockApiCall).toHaveBeenCalledTimes(1)
    })

    it('should retry failed API calls', async () => {
      const mockApiCall = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: 'success' })

      const result = await monitorExternalApi('test_api', mockApiCall, {
        retries: 2,
      })

      expect(result).toEqual({ data: 'success' })
      expect(mockApiCall).toHaveBeenCalledTimes(2)
    })

    it('should alert after all retries fail', async () => {
      const error = new Error('Persistent failure')
      const mockApiCall = jest.fn().mockRejectedValue(error)

      await expect(
        monitorExternalApi('test_api', mockApiCall, {
          retries: 2,
          alertOnFailure: true,
        })
      ).rejects.toThrow(error)

      expect(mockApiCall).toHaveBeenCalledTimes(2)
      expect(sendAlert).toHaveBeenCalledWith(
        AlertType.EXTERNAL_API_FAILED,
        expect.objectContaining({
          api: 'test_api',
          error: 'Persistent failure',
          attempts: 2,
        })
      )
    })

    it('should handle timeout', async () => {
      const mockApiCall = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 2000))
        )

      await expect(
        monitorExternalApi('test_api', mockApiCall, {
          timeout: 100,
          retries: 1,
        })
      ).rejects.toThrow('API timeout: test_api')
    })
  })
})
