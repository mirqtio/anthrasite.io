import { initializeAnalytics } from '../consent-loader'
import { ConsentPreferences } from '@/lib/context/ConsentContext'

// Mock environment variables
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'GA-TEST123'
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'

// Track created scripts
const createdScripts: any[] = []

// Mock document methods
const mockAppendChild = jest.fn()

Object.defineProperty(document, 'createElement', {
  value: jest.fn((tagName: string) => {
    const element = {
      tagName,
      src: '',
      async: false,
      innerHTML: '',
      onload: null as any,
      onerror: null as any,
    }
    createdScripts.push(element)
    return element
  }),
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
        .split('; ')
        .filter((c) => !c.trim().startsWith(cookieName))
        .join('; ')
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
    createdScripts.length = 0
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
      marketing: true,
      performance: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    // Should create scripts
    expect(createdScripts.length).toBeGreaterThan(0)
    expect(mockAppendChild).toHaveBeenCalled()

    // Check GA initialization
    expect(window.dataLayer).toBeDefined()
    expect(window.gtag).toBeDefined()

    // Find GA script
    const gaScript = createdScripts.find((s) =>
      s.src.includes('googletagmanager.com')
    )
    expect(gaScript).toBeDefined()
  })

  it('should not load analytics when consent is rejected', () => {
    const preferences: ConsentPreferences = {
      analytics: false,
      functional: true,
      marketing: false,
      performance: false,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    expect(mockAppendChild).not.toHaveBeenCalled()
  })

  it('should clear analytics cookies when consent is revoked', () => {
    // Set some mock cookies
    mockCookies = '_ga=GA1.1.123; _gid=GA1.1.456; ph_test=value; other=keep'

    // Revoke consent
    const consentRevoked: ConsentPreferences = {
      analytics: false,
      functional: true,
      marketing: false,
      performance: false,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentRevoked)

    // Analytics cookies should be cleared
    expect(mockCookies).not.toContain('_ga=')
    expect(mockCookies).not.toContain('_gid=')
    expect(mockCookies).not.toContain('ph_')
    expect(mockCookies).toContain('other=keep')
  })

  it('should disable Google Analytics when consent is revoked', () => {
    // Revoke consent
    const consentRevoked: ConsentPreferences = {
      analytics: false,
      functional: true,
      marketing: false,
      performance: false,
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
      marketing: true,
      performance: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    // Should still try to load PostHog
    expect(createdScripts.length).toBeGreaterThan(0)

    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalId
  })

  it('should handle script loading errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const preferences: ConsentPreferences = {
      analytics: true,
      functional: true,
      marketing: true,
      performance: true,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(preferences)

    // Find GA script and simulate error
    const gaScript = createdScripts.find((s) =>
      s.src.includes('googletagmanager.com')
    )
    if (gaScript && gaScript.onerror) {
      gaScript.onerror()
    }

    expect(consoleSpy).toHaveBeenCalledWith('Failed to load Google Analytics')

    consoleSpy.mockRestore()
  })

  it('should listen for consent update events', () => {
    const preferences: ConsentPreferences = {
      analytics: true,
      functional: true,
      marketing: true,
      performance: true,
      timestamp: new Date().toISOString(),
    }

    // Clear mocks to ensure we can track the event
    jest.clearAllMocks()

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('consentUpdated', { detail: preferences })
    )

    // Should trigger analytics initialization
    expect(createdScripts.length).toBeGreaterThan(0)
  })

  it('should clear cookies with wildcard patterns', () => {
    mockCookies =
      '_ga_ABC123=value1; _ga_XYZ789=value2; _gat_tracker=value3; regular_cookie=keep'

    const consentRevoked: ConsentPreferences = {
      analytics: false,
      functional: true,
      marketing: false,
      performance: false,
      timestamp: new Date().toISOString(),
    }

    initializeAnalytics(consentRevoked)

    // All GA-related cookies should be cleared
    expect(mockCookies).not.toContain('_ga_ABC')
    expect(mockCookies).not.toContain('_ga_XYZ')
    expect(mockCookies).not.toContain('_gat_')
    expect(mockCookies).toContain('regular_cookie=keep')
  })
})
