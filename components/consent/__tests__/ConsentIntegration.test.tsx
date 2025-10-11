import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConsentProvider } from '@/lib/context/ConsentContext'
import { ConsentManager } from '../ConsentManager'
import { Analytics } from '@/app/_components/Analytics/Analytics'

// Mock the analytics module
const mockStartAnalytics = jest.fn().mockResolvedValue(undefined)

jest.mock('@/lib/analytics', () => ({
  startAnalytics: mockStartAnalytics,
}))

// Mock analytics client
jest.mock('@/lib/analytics/analytics-client', () => ({
  trackPageView: jest.fn(),
}))

// Mock useWebVitals hook
jest.mock('@/lib/analytics/hooks/useWebVitals', () => ({
  useWebVitals: jest.fn(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => ({ toString: () => '' }),
}))

// Import the mocked function after the mock is set up
import { startAnalytics as mockStartAnalyticsImport } from '@/lib/analytics'

describe('Consent Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should show banner and handle accept all flow', async () => {
    render(
      <ConsentProvider>
        <ConsentManager />
        <Analytics />
      </ConsentProvider>
    )

    // Banner should be visible
    await waitFor(() => {
      expect(screen.getByText('We value your privacy')).toBeInTheDocument()
    })

    // Click accept all
    fireEvent.click(screen.getByRole('button', { name: 'Accept all cookies' }))

    // Banner should disappear
    await waitFor(() => {
      expect(
        screen.queryByText('We value your privacy')
      ).not.toBeInTheDocument()
    })

    // Analytics should be initialized with consent
    await waitFor(() => {
      expect(mockStartAnalyticsImport).toHaveBeenCalled()
    })

    // Check localStorage
    const stored = JSON.parse(
      localStorage.getItem('anthrasite_cookie_consent') || '{}'
    )
    expect(stored.preferences.analytics).toBe(true)
    expect(stored.preferences.functional).toBe(true)
  })

  it('should show banner and handle reject all flow', async () => {
    render(
      <ConsentProvider>
        <ConsentManager />
        <Analytics />
      </ConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('We value your privacy')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reject all cookies' }))

    await waitFor(() => {
      expect(
        screen.queryByText('We value your privacy')
      ).not.toBeInTheDocument()
    })

    // Analytics should not be initialized when consent is rejected
    await waitFor(() => {
      expect(mockStartAnalyticsImport).not.toHaveBeenCalled()
    })
  })

  it('should handle preferences modal flow', async () => {
    render(
      <ConsentProvider>
        <ConsentManager />
        <Analytics />
      </ConsentProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('We value your privacy')).toBeInTheDocument()
    })

    // Open preferences
    fireEvent.click(
      screen.getByRole('button', { name: 'Manage cookie preferences' })
    )

    // Modal should open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Cookie Preferences')).toBeInTheDocument()
    })

    // Toggle analytics on
    const analyticsToggle = screen.getByRole('switch', {
      name: /Analytics Cookies/,
    })
    fireEvent.click(analyticsToggle)

    // Save preferences
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }))

    // Modal should close and banner should disappear
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(
        screen.queryByText('We value your privacy')
      ).not.toBeInTheDocument()
    })

    // Check that analytics was initialized
    await waitFor(() => {
      expect(mockStartAnalyticsImport).toHaveBeenCalled()
    })
  })

  it('should remember consent on page reload', async () => {
    // Set previous consent
    localStorage.setItem(
      'anthrasite_cookie_consent',
      JSON.stringify({
        version: '1.0',
        preferences: {
          analytics: true,
          functional: true,
          marketing: false,
          performance: false,
          timestamp: new Date().toISOString(),
        },
      })
    )

    render(
      <ConsentProvider>
        <ConsentManager />
        <Analytics />
      </ConsentProvider>
    )

    // Banner should not be shown
    await waitFor(
      () => {
        expect(
          screen.queryByText('We value your privacy')
        ).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )

    // Analytics should be initialized with stored preferences
    await waitFor(() => {
      expect(mockStartAnalyticsImport).toHaveBeenCalled()
    })
  })

  it('should show banner again if consent version changes', async () => {
    // Set old version consent
    localStorage.setItem(
      'anthrasite_cookie_consent',
      JSON.stringify({
        version: '0.9',
        preferences: {
          analytics: true,
          functional: true,
          timestamp: new Date().toISOString(),
        },
      })
    )

    render(
      <ConsentProvider>
        <ConsentManager />
        <Analytics />
      </ConsentProvider>
    )

    // Banner should be shown due to version mismatch
    await waitFor(() => {
      expect(screen.getByText('We value your privacy')).toBeInTheDocument()
    })
  })
})
