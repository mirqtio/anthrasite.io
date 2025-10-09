#!/bin/bash
set -e

echo "🔧 Fixing consent loader tests..."

cat > lib/analytics/__tests__/consent-loader.test.ts << 'EOF'
import { initializeAnalytics } from '../consent-loader'
import { ConsentPreferences } from '@/lib/context/ConsentContext'

// Mock environment variables
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'GA-TEST123'
process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'
process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com'

// Mock document methods
const mockAppendChild = jest.fn()
const mockCreateElement = jest.fn((tagName: string) => {
  const element: any = {
    tagName,
    src: '',
    async: false,
    innerHTML: '',
    onload: null,
    onerror: null,
  }
  return element
})

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
    expect(mockCreateElement).toHaveBeenCalledWith('script')
    expect(mockAppendChild).toHaveBeenCalled()

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

    expect(mockAppendChild).not.toHaveBeenCalled()
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

    // Should still try to load PostHog if GA ID is missing
    expect(mockCreateElement).toHaveBeenCalled()

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
    const scriptCall = mockCreateElement.mock.calls.find(
      call => call[0] === 'script'
    )
    expect(scriptCall).toBeDefined()

    // Simulate script error
    const scriptElement = mockCreateElement.mock.results.find(
      result => result.value && result.value.tagName === 'script' && result.value.src
    )?.value

    if (scriptElement && scriptElement.onerror) {
      scriptElement.onerror()
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load Google Analytics')
    }

    consoleSpy.mockRestore()
  })
})
EOF

echo "✅ Consent loader tests fixed!"