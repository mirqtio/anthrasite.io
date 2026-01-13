import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Analytics } from '../Analytics'

jest.mock('@/lib/analytics/analytics-client', () => ({
  trackPageView: jest.fn(),
}))

jest.mock('@/lib/analytics/hooks/useWebVitals', () => ({
  useWebVitals: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Import after mocks to ensure mocks are applied
import { trackPageView } from '@/lib/analytics/analytics-client'
import { useWebVitals } from '@/lib/analytics/hooks/useWebVitals'
import { usePathname, useSearchParams } from 'next/navigation'

describe('Analytics Component', () => {
  const originalEnv = process.env
  let appendChildSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }

    // Reset window objects
    delete (window as any).gtag
    delete (window as any).dataLayer

    // Spy on appendChild to track script loading
    appendChildSpy = jest.spyOn(document.head, 'appendChild')
  })

  afterEach(() => {
    process.env = originalEnv
    appendChildSpy.mockRestore()
    // Clean up any scripts added during tests
    document
      .querySelectorAll('script[src*="googletagmanager.com"]')
      .forEach((el) => el.remove())
  })

  it('should load gtag script when analytics is enabled', async () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = 'G-TESTID123'
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'

    render(<Analytics />)

    await waitFor(() => {
      const scripts = document.querySelectorAll(
        'script[src*="googletagmanager.com"]'
      )
      expect(scripts.length).toBe(1)
      expect(scripts[0].getAttribute('src')).toContain('G-TESTID123')
    })
  })

  it('should not load script when analytics is disabled', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'false'
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = 'G-TESTID123'

    render(<Analytics />)

    const scripts = document.querySelectorAll(
      'script[src*="googletagmanager.com"]'
    )
    expect(scripts.length).toBe(0)
  })

  it('should not load script when measurement ID is missing', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

    render(<Analytics />)

    const scripts = document.querySelectorAll(
      'script[src*="googletagmanager.com"]'
    )
    expect(scripts.length).toBe(0)
  })

  it('should track page view when gtag is available', () => {
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = 'G-TESTID123'

    // Set up window.gtag to simulate script already loaded
    ;(window as any).gtag = jest.fn()

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

  it('should call navigation hooks', () => {
    render(<Analytics />)

    expect(usePathname).toHaveBeenCalled()
    expect(useSearchParams).toHaveBeenCalled()
  })

  it('should track page view on route change', () => {
    const mockUsePathname = usePathname as jest.Mock
    const mockUseSearchParams = useSearchParams as jest.Mock

    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'

    // Set up window.gtag to simulate script already loaded
    ;(window as any).gtag = jest.fn()

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

    expect(() => render(<Analytics />)).not.toThrow()
  })

  it('should not load duplicate scripts', async () => {
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = 'G-TESTID123'
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'

    // Pre-add a script to simulate already loaded
    const existingScript = document.createElement('script')
    existingScript.src =
      'https://www.googletagmanager.com/gtag/js?id=G-EXISTING'
    document.head.appendChild(existingScript)

    render(<Analytics />)

    // Should not add another script
    const scripts = document.querySelectorAll(
      'script[src*="googletagmanager.com"]'
    )
    expect(scripts.length).toBe(1)
  })

  it('should skip analytics in E2E mode', () => {
    process.env.NEXT_PUBLIC_E2E = 'true'
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = 'G-TESTID123'
    process.env.NEXT_PUBLIC_ANALYTICS_ENABLED = 'true'

    render(<Analytics />)

    const scripts = document.querySelectorAll(
      'script[src*="googletagmanager.com"]'
    )
    expect(scripts.length).toBe(0)
    expect(trackPageView).not.toHaveBeenCalled()
  })
})
