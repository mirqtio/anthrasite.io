import { GET, POST } from '../route'
import { NextRequest } from 'next/server'
import * as Sentry from '@sentry/nextjs'

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}))

// Mock console
const originalConsole = {
  log: console.log,
  error: console.error,
}

describe('Test Monitoring API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.log = jest.fn()
    console.error = jest.fn()
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.error = originalConsole.error
    delete process.env.NODE_ENV
  })

  describe('GET', () => {
    it('should return monitoring tools status', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring'
      )
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('message', 'Monitoring test endpoints')
      expect(data).toHaveProperty('endpoints')
      expect(data.endpoints).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            method: 'POST',
            path: '/api/test-monitoring',
          }),
        ])
      )
    })
  })

  describe('POST', () => {
    it('should handle error test type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'error' }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Error captured and sent to monitoring',
      })

      expect(Sentry.captureException).toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(
        'Test error:',
        expect.any(Error)
      )
    })

    it('should handle warning test type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'warning' }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Warning sent to monitoring',
      })

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test warning message',
        'warning'
      )
      expect(console.log).toHaveBeenCalledWith('Test warning logged')
    })

    it('should handle info test type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'info' }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Info event sent to monitoring',
      })

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test info event',
        'info'
      )
      expect(console.log).toHaveBeenCalledWith('Test info logged')
    })

    it('should handle custom test type with custom data', async () => {
      const customData = {
        userId: 'test-user-123',
        action: 'test-action',
        metadata: { foo: 'bar' },
      }

      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({
            type: 'custom',
            customData,
          }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        success: true,
        message: 'Custom event sent to monitoring',
        customData,
      })

      expect(console.log).toHaveBeenCalledWith(
        'Custom monitoring event:',
        customData
      )
    })

    it('should handle invalid test type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'invalid' }),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid test type. Use: error, warning, info, or custom',
      })
    })

    it('should handle missing test type', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid test type. Use: error, warning, info, or custom',
      })
    })

    it('should return 404 in production', async () => {
      process.env.NODE_ENV = 'production'

      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: JSON.stringify({ type: 'error' }),
        }
      )

      const response = await POST(request)

      expect(response.status).toBe(404)
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/test-monitoring',
        {
          method: 'POST',
          body: 'invalid json',
        }
      )

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({
        error: 'Invalid test type. Use: error, warning, info, or custom',
      })
    })
  })
})
