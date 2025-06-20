// Simple test to verify the consent loader module exports
import * as consentLoader from '../consent-loader'

describe('consent-loader module', () => {
  it('should export initializeAnalytics function', () => {
    expect(typeof consentLoader.initializeAnalytics).toBe('function')
  })

  it('should handle null preferences without error', () => {
    expect(() => {
      consentLoader.initializeAnalytics(null)
    }).not.toThrow()
  })

  it('should handle preferences object without error', () => {
    expect(() => {
      consentLoader.initializeAnalytics({
        analytics: true,
        functional: true,
        timestamp: new Date().toISOString(),
      })
    }).not.toThrow()
  })
})
