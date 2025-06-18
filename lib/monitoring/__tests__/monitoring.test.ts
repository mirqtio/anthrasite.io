import { captureError, trackEvent, sendAlert, AlertType, monitorApiCall } from '../index'
import * as Sentry from '@sentry/nextjs'

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  startSpan: jest.fn((options, callback) => {
    return callback()
  }),
  startTransaction: jest.fn(() => ({
    startChild: jest.fn(() => ({
      setStatus: jest.fn(),
      finish: jest.fn(),
    })),
    setStatus: jest.fn(),
    finish: jest.fn(),
  })),
  getCurrentHub: jest.fn(() => ({
    getScope: jest.fn(() => ({
      getSpan: jest.fn(() => ({
        startChild: jest.fn(() => ({
          setStatus: jest.fn(),
          finish: jest.fn(),
        })),
      })),
    })),
  })),
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Datadog functions
jest.mock('../datadog', () => ({
  initDatadog: jest.fn(),
  logError: jest.fn(),
  trackAction: jest.fn(),
  setDatadogUser: jest.fn(),
}))

describe('Monitoring', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  
  describe('captureError', () => {
    it('should send error to Sentry', () => {
      const error = new Error('Test error')
      const context = { userId: '123' }
      
      captureError(error, context)
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        contexts: {
          custom: context,
        },
      })
    })
  })
  
  describe('trackEvent', () => {
    it('should add breadcrumb to Sentry', () => {
      const eventName = 'test_event'
      const data = { value: 42 }
      
      trackEvent(eventName, data)
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: eventName,
        category: 'custom',
        level: 'info',
        data,
      })
    })
  })
  
  describe('sendAlert', () => {
    it('should capture message in Sentry with alert context', () => {
      const details = { error: 'Payment failed' }
      
      sendAlert(AlertType.PAYMENT_FAILED, details)
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        `Alert: ${AlertType.PAYMENT_FAILED}`,
        expect.objectContaining({
          level: 'warning',
          contexts: {
            alert: expect.objectContaining({
              alert_type: AlertType.PAYMENT_FAILED,
              ...details,
            }),
          },
        })
      )
    })
  })
  
  describe('monitorApiCall', () => {
    it('should track successful API calls', async () => {
      const apiName = 'test_api'
      const apiCall = jest.fn().mockResolvedValue({ success: true })
      
      const result = await monitorApiCall(apiName, apiCall)
      
      expect(result).toEqual({ success: true })
      expect(apiCall).toHaveBeenCalled()
    })
    
    it('should capture errors from failed API calls', async () => {
      const apiName = 'test_api'
      const error = new Error('API failed')
      const apiCall = jest.fn().mockRejectedValue(error)
      
      await expect(monitorApiCall(apiName, apiCall)).rejects.toThrow(error)
      
      expect(Sentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          contexts: {
            custom: expect.objectContaining({
              api_endpoint: apiName,
            }),
          },
        })
      )
    })
  })
})