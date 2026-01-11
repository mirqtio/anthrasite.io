import { getCookieConsent, onConsentChange } from '../consent'
import { ConsentPreferences } from '@/lib/context/ConsentContext'

describe('Cookie Consent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('getCookieConsent', () => {
    it('should return default consent when no stored preferences', () => {
      const consent = getCookieConsent()

      // US legal model: analytics and performance enabled by default
      expect(consent).toEqual({
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: expect.any(String),
      })
    })

    it('should parse and return stored consent from localStorage', () => {
      const storedConsent = {
        version: '1.0',
        preferences: {
          analytics: true,
          marketing: false,
          performance: true,
          functional: true,
          timestamp: '2024-01-15T10:00:00Z',
        },
      }
      localStorage.setItem(
        'anthrasite_cookie_consent',
        JSON.stringify(storedConsent)
      )

      const consent = getCookieConsent()

      expect(consent).toEqual({
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: '2024-01-15T10:00:00Z',
      })
    })

    it('should handle missing preferences object', () => {
      localStorage.setItem('anthrasite_cookie_consent', JSON.stringify({}))

      const consent = getCookieConsent()

      // US legal model: analytics and performance enabled by default
      expect(consent).toEqual({
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: expect.any(String),
      })
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('anthrasite_cookie_consent', 'invalid json')
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const consent = getCookieConsent()

      // US legal model: analytics and performance enabled by default
      expect(consent).toEqual({
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: expect.any(String),
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reading consent preferences:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle server-side environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      const consent = getCookieConsent()

      // US legal model: analytics and performance enabled by default
      expect(consent).toEqual({
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: expect.any(String),
      })

      global.window = originalWindow
    })

    it('should handle localStorage errors', () => {
      const originalGetItem = Storage.prototype.getItem
      Storage.prototype.getItem = jest.fn(() => {
        throw new Error('Storage error')
      })
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const consent = getCookieConsent()

      // US legal model: analytics and performance enabled by default
      expect(consent).toEqual({
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: expect.any(String),
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error reading consent preferences:',
        expect.any(Error)
      )

      Storage.prototype.getItem = originalGetItem
      consoleSpy.mockRestore()
    })
  })

  describe('onConsentChange', () => {
    it('should register and call event listener', () => {
      const callback = jest.fn()
      const unsubscribe = onConsentChange(callback)

      const consentData: ConsentPreferences = {
        analytics: true,
        marketing: false,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: '2024-01-15T10:00:00Z',
      }

      const event = new CustomEvent('consentUpdated', { detail: consentData })
      window.dispatchEvent(event)

      expect(callback).toHaveBeenCalledWith(consentData)

      unsubscribe()
    })

    it('should unsubscribe listener', () => {
      const callback = jest.fn()
      const unsubscribe = onConsentChange(callback)

      unsubscribe()

      const event = new CustomEvent('consentUpdated', {
        detail: {
          analytics: true,
          marketing: false,
          performance: false,
          functional: true,
          doNotSell: false,
          timestamp: '2024-01-15T10:00:00Z',
        },
      })
      window.dispatchEvent(event)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      const unsubscribe1 = onConsentChange(callback1)
      const unsubscribe2 = onConsentChange(callback2)

      const consentData: ConsentPreferences = {
        analytics: true,
        marketing: true,
        performance: true,
        functional: true,
        doNotSell: false,
        timestamp: '2024-01-15T10:00:00Z',
      }

      const event = new CustomEvent('consentUpdated', { detail: consentData })
      window.dispatchEvent(event)

      expect(callback1).toHaveBeenCalledWith(consentData)
      expect(callback2).toHaveBeenCalledWith(consentData)

      unsubscribe1()
      unsubscribe2()
    })

    it('should handle server-side environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      const callback = jest.fn()
      const unsubscribe = onConsentChange(callback)

      expect(unsubscribe).toBeInstanceOf(Function)
      unsubscribe() // Should not throw

      expect(callback).not.toHaveBeenCalled()

      global.window = originalWindow
    })

    it('should allow registering multiple listeners', () => {
      const callback1 = jest.fn()
      const callback2 = jest.fn()

      const unsubscribe1 = onConsentChange(callback1)
      const unsubscribe2 = onConsentChange(callback2)

      const consentData: ConsentPreferences = {
        analytics: true,
        marketing: false,
        performance: false,
        functional: true,
        doNotSell: false,
        timestamp: '2024-01-15T10:00:00Z',
      }

      const event = new CustomEvent('consentUpdated', { detail: consentData })
      window.dispatchEvent(event)

      expect(callback1).toHaveBeenCalledWith(consentData)
      expect(callback2).toHaveBeenCalledWith(consentData)

      unsubscribe1()
      unsubscribe2()
    })
  })
})
