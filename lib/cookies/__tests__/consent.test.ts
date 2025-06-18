import { 
  getCookieConsent, 
  setCookieConsent, 
  hasConsent,
  onConsentChange,
  CONSENT_COOKIE_NAME 
} from '../consent'
import Cookies from 'js-cookie'

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn()
}))

describe('Cookie Consent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCookieConsent', () => {
    it('should return default consent when no cookie exists', () => {
      ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
      
      const consent = getCookieConsent()
      
      expect(consent).toEqual({
        analytics: false,
        marketing: false,
        preferences: false,
        performance: false
      })
    })

    it('should parse and return stored consent', () => {
      const storedConsent = {
        analytics: true,
        marketing: false,
        preferences: true,
        performance: false
      }
      ;(Cookies.get as jest.Mock).mockReturnValue(JSON.stringify(storedConsent))
      
      const consent = getCookieConsent()
      
      expect(consent).toEqual(storedConsent)
    })

    it('should handle invalid JSON in cookie', () => {
      ;(Cookies.get as jest.Mock).mockReturnValue('invalid json')
      
      const consent = getCookieConsent()
      
      expect(consent).toEqual({
        analytics: false,
        marketing: false,
        preferences: false,
        performance: false
      })
    })

    it('should handle server-side environment', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      const consent = getCookieConsent()
      
      expect(consent).toEqual({
        analytics: false,
        marketing: false,
        preferences: false,
        performance: false
      })
      expect(Cookies.get).not.toHaveBeenCalled()
      
      global.window = originalWindow
    })
  })

  describe('setCookieConsent', () => {
    it('should store consent in cookie', () => {
      const consent = {
        analytics: true,
        marketing: false,
        preferences: true,
        performance: false
      }
      
      setCookieConsent(consent)
      
      expect(Cookies.set).toHaveBeenCalledWith(
        CONSENT_COOKIE_NAME,
        JSON.stringify(consent),
        expect.objectContaining({
          expires: 365,
          sameSite: 'strict',
          secure: true
        })
      )
    })

    it('should notify listeners when consent changes', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      onConsentChange(listener1)
      onConsentChange(listener2)
      
      const newConsent = {
        analytics: true,
        marketing: true,
        preferences: false,
        performance: false
      }
      
      setCookieConsent(newConsent)
      
      expect(listener1).toHaveBeenCalledWith(newConsent)
      expect(listener2).toHaveBeenCalledWith(newConsent)
    })

    it('should not store on server-side', () => {
      const originalWindow = global.window
      delete (global as any).window
      
      setCookieConsent({
        analytics: true,
        marketing: false,
        preferences: false,
        performance: false
      })
      
      expect(Cookies.set).not.toHaveBeenCalled()
      
      global.window = originalWindow
    })
  })

  describe('hasConsent', () => {
    it('should return true when specific consent is granted', () => {
      ;(Cookies.get as jest.Mock).mockReturnValue(JSON.stringify({
        analytics: true,
        marketing: false,
        preferences: true,
        performance: false
      }))
      
      expect(hasConsent('analytics')).toBe(true)
      expect(hasConsent('preferences')).toBe(true)
    })

    it('should return false when specific consent is not granted', () => {
      ;(Cookies.get as jest.Mock).mockReturnValue(JSON.stringify({
        analytics: true,
        marketing: false,
        preferences: false,
        performance: false
      }))
      
      expect(hasConsent('marketing')).toBe(false)
      expect(hasConsent('performance')).toBe(false)
    })

    it('should return false when no consent cookie exists', () => {
      ;(Cookies.get as jest.Mock).mockReturnValue(undefined)
      
      expect(hasConsent('analytics')).toBe(false)
    })
  })

  describe('onConsentChange', () => {
    it('should register multiple listeners', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      
      const unsubscribe1 = onConsentChange(listener1)
      const unsubscribe2 = onConsentChange(listener2)
      
      const newConsent = {
        analytics: true,
        marketing: false,
        preferences: false,
        performance: false
      }
      
      setCookieConsent(newConsent)
      
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
      
      // Test unsubscribe
      unsubscribe1()
      setCookieConsent(newConsent)
      
      expect(listener1).toHaveBeenCalledTimes(1) // Not called again
      expect(listener2).toHaveBeenCalledTimes(2) // Called again
      
      unsubscribe2()
    })

    it('should handle listener errors gracefully', () => {
      const errorListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const goodListener = jest.fn()
      
      onConsentChange(errorListener)
      onConsentChange(goodListener)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      setCookieConsent({
        analytics: true,
        marketing: false,
        preferences: false,
        performance: false
      })
      
      expect(errorListener).toHaveBeenCalled()
      expect(goodListener).toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error notifying consent change listener:',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })
})