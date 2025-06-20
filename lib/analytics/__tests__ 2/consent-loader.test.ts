import { initializeAnalytics } from '../consent-loader'
import { ConsentPreferences } from '@/lib/context/ConsentContext'

// Mock environment variables
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'GA-TEST123'
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'

// Mock document methods
const mockScript = {
  src: '',
  async: false,
  onload: null as any,
  onerror: null as any,
}

const mockAppendChild = jest.fn()
const mockCreateElement = jest.fn(() => mockScript)

Object.defineProperty(document, 'createElement', {
  value: mockCreateElement,
  writable: true,
})

Object.defineProperty(document.head, 'appendChild', {
  value: mockAppendChild,
  writable: true,
})

// Mock document.cookie
let mockCookies = ''
Object.defineProperty(document, 'cookie', {
  get: () => mockCookies,
  set: (value: string) => {
    if (value.includes('expires=Thu, 01 Jan 1970')) {
      // Simulate cookie deletion
      const cookieName = value.split('=')[0]
      mockCookies = mockCookies
        .split(';')
        .filter((c) => !c.trim().startsWith(cookieName))
        .join(';')
    } else {
      mockCookies = value
    }
  },
  configurable: true,
})

describe('consent-loader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookies = ''
    // Reset window objects
    delete (window as any).gtag
    delete (window as any).dataLayer
    delete (window as any).posthog
    delete (window as any)[
      `ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
    ]
  })

  it('should not load analytics when preferences is null', () => {
    initializeAnalytics(null)

    expect(mockAppendChild).not.toHaveBeenCalled()
    expect(window.gtag).toBeUndefined()
    expect(window.posthog).toBeUndefined()
  })

  it('should load analytics when consent is given', () => {
    const preferences: ConsentPreferences = {
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    // Should create scripts for GA and PostHog
    expect(mockCreateElement).toHaveBeenCalledWith('script')
    expect(mockAppendChild).toHaveBeenCalled()

    // Check GA initialization
    expect(window.dataLayer).toBeDefined()
    expect(window.gtag).toBeDefined()
    expect(mockScript.src).toContain('googletagmanager.com')
  })

  it('should not load analytics when consent is rejected', () => {
    const preferences: ConsentPreferences = {
      analytics: false,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    expect(mockAppendChild).not.toHaveBeenCalled()
  })

  it('should clear analytics cookies when consent is revoked', () => {
    // Set some mock cookies
    mockCookies = '_ga=GA1.1.123; _gid=GA1.1.456; ph_test=value; other=keep'

    // First give consent
    const consentGiven: ConsentPreferences = {
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentGiven)

    // Simulate script load
    if (mockScript.onload) {
      mockScript.onload()
    }

    // Then revoke consent
    const consentRevoked: ConsentPreferences = {
      analytics: false,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentRevoked)

    // Analytics cookies should be cleared
    expect(mockCookies).not.toContain('_ga')
    expect(mockCookies).not.toContain('_gid')
    expect(mockCookies).not.toContain('ph_')
    expect(mockCookies).toContain('other=keep')
  })

  it('should disable Google Analytics when consent is revoked', () => {
    // First load analytics
    const consentGiven: ConsentPreferences = {
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentGiven)

    // Then revoke
    const consentRevoked: ConsentPreferences = {
      analytics: false,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentRevoked)

    // GA should be disabled
    expect(
      (window as any)[`ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`]
    ).toBe(true)
  })

  it('should handle missing GA measurement ID', () => {
    const originalId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    const preferences: ConsentPreferences = {
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    // Should still try to load PostHog
    expect(mockCreateElement).toHaveBeenCalled()

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalId
  })

  it('should handle script loading errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const preferences: ConsentPreferences = {
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    // Simulate script error
    if (mockScript.onerror) {
      mockScript.onerror()
    }

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load Google Analytics')

    consoleSpy.mockRestore()
  })

  it('should listen for consent update events', () => {
    const preferences: ConsentPreferences = {
      analytics: true,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('consentUpdated', { detail: preferences })
    )

    // Should trigger analytics initialization
    expect(mockCreateElement).toHaveBeenCalled()
  })

  it('should clear cookies with wildcard patterns', () => {
    mockCookies =
      '_ga_ABC123=value1; _ga_XYZ789=value2; _gat_tracker=value3; regular_cookie=keep'

    const consentRevoked: ConsentPreferences = {
      analytics: false,
      functional: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentRevoked)

    // All GA-related cookies should be cleared
    expect(mockCookies).not.toContain('_ga_')
    expect(mockCookies).not.toContain('_gat_')
    expect(mockCookies).toContain('regular_cookie=keep')
  })
})
