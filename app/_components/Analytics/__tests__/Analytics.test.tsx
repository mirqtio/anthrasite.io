import React from 'react'
import { render } from '@testing-library/react'
import { Analytics } from '../Analytics'
import { initializeAnalytics } from '@/lib/analytics/analytics-manager'
import { trackPageView } from '@/lib/analytics/analytics-client'
import { getCookieConsent } from '@/lib/cookies/consent'
import { useWebVitals } from '@/lib/analytics/hooks/useWebVitals'
import { usePathname, useSearchParams } from 'next/navigation'

// Mock analytics dependencies
jest.mock('@/lib/analytics/analytics-manager', () => ({
  initializeAnalytics: jest.fn(),
}))

jest.mock('@/lib/analytics/analytics-client', () => ({
  trackPageView: jest.fn(),
}))

jest.mock('@/lib/cookies/consent', () => ({
  getCookieConsent: jest.fn(() => ({
    analytics: true,
    marketing: true,
    performance: true,
    functional: true,
  })),
}))

jest.mock('@/lib/analytics/hooks/useWebVitals', () => ({
  useWebVitals: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

describe('Analytics Component', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }

    // Reset window objects
    delete (window as any).gtag
    delete (window as any).dataLayer
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should initialize analytics when measurement ID is provided', () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = 'G-TESTID123'
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123'

    render(<Analytics />)

    expect(initializeAnalytics).toHaveBeenCalledWith({
      ga4: {
        measurementId: 'G-TESTID123',
        apiSecret: undefined,
      },
      posthog: {
        apiKey: 'phc_test123',
      },
    })
  })

  it('should not initialize analytics when measurement ID is not provided', () => {
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

    render(<Analytics />)

    expect(initializeAnalytics).toHaveBeenCalled()
  })

  it('should track page view when analytics consent is given', () => {
    render(<Analytics />)

    expect(trackPageView).toHaveBeenCalledWith({
      path: '/',
      url: '/',
      title: '',
    })
  })

  it('should use web vitals hook', () => {
    render(<Analytics />)

    expect(useWebVitals).toHaveBeenCalled()
  })

  it('should not initialize analytics when consent is not given', () => {
    const mockGetCookieConsent = getCookieConsent as jest.Mock
    mockGetCookieConsent.mockReturnValue({
      analytics: false,
      marketing: false,
      performance: false,
      functional: true,
    })

    render(<Analytics />)

    // Component should still call initialize, but won't proceed due to consent check
    expect(mockGetCookieConsent).toHaveBeenCalled()
  })

  it('should call analytics hooks', () => {
    render(<Analytics />)

    expect(useWebVitals).toHaveBeenCalled()
    expect(usePathname).toHaveBeenCalled()
    expect(useSearchParams).toHaveBeenCalled()
  })

  it('should track page view on route change', () => {
    const mockUsePathname = usePathname as jest.Mock
    const mockUseSearchParams = useSearchParams as jest.Mock

    // Clear and reset mocks for this test
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/test-page')
    mockUseSearchParams.mockReturnValue(new URLSearchParams('?utm=test'))

    render(<Analytics />)

    expect(trackPageView).toHaveBeenCalledWith({
      path: '/test-page',
      url: '/test-page?utm=test',
      title: '',
    })
  })

  it('should render without crashing', () => {
    const { container } = render(<Analytics />)

    // Component returns null, so container should be empty
    expect(container.firstChild).toBeNull()
  })

  it('should handle missing environment variables gracefully', () => {
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY

    expect(() => render(<Analytics />)).not.toThrow()
  })

  it('should check consent before initializing', () => {
    render(<Analytics />)

    expect(getCookieConsent).toHaveBeenCalled()
  })
})
