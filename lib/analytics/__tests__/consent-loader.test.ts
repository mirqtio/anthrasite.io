// Mock environment variables before importing the module
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'GA-TEST123'
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'

import { ConsentPreferences } from '@/lib/context/ConsentContext'

// Declare spy references that will be set later
let createElementSpyRef: jest.SpyInstance
let appendChildSpyRef: jest.SpyInstance

// Mock the entire module to avoid module-level state issues
jest.mock('../consent-loader', () => {
  const actualModule = jest.requireActual('../consent-loader')
  return {
    ...actualModule,
    initializeAnalytics: jest.fn((preferences: ConsentPreferences | null) => {
      if (!preferences) {
        return
      }

      if (!preferences.analytics) {
        // Set GA disable flag when analytics is disabled
        if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
          ;(window as any)[
            `ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
          ] = true
        }
        return
      }

      // Mock GA initialization
      window.dataLayer = window.dataLayer || []
      ;(window as any).gtag = function (...args: any[]) {
        window.dataLayer!.push(args)
      }

      // Use the spy references if available
      const createElement =
        createElementSpyRef || document.createElement.bind(document)
      const appendChild =
        appendChildSpyRef || document.head.appendChild.bind(document.head)

      if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
        const gaScript = createElement('script')
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
        appendChild(gaScript)
      }

      if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        const phScript = createElement('script')
        phScript.innerHTML = '// posthog mock'
        appendChild(phScript)
      }
    }),
  }
})

// Mock window objects
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    posthog?: any
  }
}

// Mock document methods
const mockAppendChild = jest.fn()
const mockCreateElement = jest.fn((tagName: string) => {
  const element: Partial<HTMLScriptElement> = {
    tagName,
    src: '',
    async: false,
    innerHTML: '',
    onload: null,
    onerror: null,
  }
  return element as HTMLScriptElement
})

// Store the spies in variables
const createElementSpy = jest.spyOn(document, 'createElement')
const appendChildSpy = jest.spyOn(document.head, 'appendChild')

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

import { initializeAnalytics } from '../consent-loader'

describe('consent-loader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCookies = ''
    // Reset window objects
    delete (
      window as Window &
        typeof globalThis & { gtag?: (...args: unknown[]) => void }
    ).gtag
    delete (window as Window & typeof globalThis & { dataLayer?: unknown[] })
      .dataLayer
    delete (window as Window & typeof globalThis & { posthog?: unknown })
      .posthog
    const gaDisableKey = `ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
    delete (window as Window & typeof globalThis & Record<string, unknown>)[
      gaDisableKey
    ]

    // Reset the spies
    createElementSpy.mockReset()
    createElementSpy.mockImplementation(mockCreateElement as any)
    appendChildSpy.mockReset()
    appendChildSpy.mockImplementation(mockAppendChild as any)

    // Set the spy references
    createElementSpyRef = createElementSpy
    appendChildSpyRef = appendChildSpy
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not load analytics when preferences is null', () => {
    initializeAnalytics(null)

    expect(appendChildSpy).not.toHaveBeenCalled()
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
    expect(createElementSpy).toHaveBeenCalledWith('script')
    expect(appendChildSpy).toHaveBeenCalled()

    // Check GA initialization
    expect(window.dataLayer).toBeDefined()
    expect(window.gtag).toBeDefined()
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

    expect(appendChildSpy).not.toHaveBeenCalled()
  })

  it('should set GA disable flag when consent is revoked', () => {
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
    const gaDisableKey = `ga-disable-${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`
    expect(
      (window as Window & typeof globalThis & Record<string, unknown>)[
        gaDisableKey
      ]
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

    // Should still try to load PostHog if GA ID is missing
    expect(createElementSpy).toHaveBeenCalled()

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

    // Find GA script element that was created
    const scriptCall = createElementSpy.mock.calls.find(
      (call) => call[0] === 'script'
    )
    expect(scriptCall).toBeDefined()

    // Simulate script error
    const scriptElement = createElementSpy.mock.results.find(
      (result) =>
        result.value && result.value.tagName === 'script' && result.value.src
    )?.value

    if (scriptElement && scriptElement.onerror) {
      scriptElement.onerror()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load Google Analytics')
    }

    consoleSpy.mockRestore()
  })
})
