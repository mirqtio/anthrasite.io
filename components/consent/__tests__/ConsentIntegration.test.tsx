import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ConsentProvider } from '@/lib/context/ConsentContext'
import { ConsentManager } from '../ConsentManager'

// Mock the analytics module
jest.mock('@/lib/analytics/consent-loader', () => ({
  initializeAnalytics: jest.fn(),
}))

import { initializeAnalytics } from '@/lib/analytics/consent-loader'

describe('Consent Integration', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should show banner and handle accept all flow', async () => {
    render(
      <ConsentProvider>
        <ConsentManager />
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
    expect(initializeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: true,
        functional: true,
      })
    )

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

    expect(initializeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: false,
        functional: false,
      })
    )
  })

  it('should handle preferences modal flow', async () => {
    render(
      <ConsentProvider>
        <ConsentManager />
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

    // Check that analytics was initialized with correct preferences
    expect(initializeAnalytics).toHaveBeenLastCalledWith(
      expect.objectContaining({
        analytics: true,
        functional: true,
      })
    )
  })

  it('should remember consent on page reload', async () => {
    // Set previous consent
    localStorage.setItem(
      'anthrasite_cookie_consent',
      JSON.stringify({
        version: '1.0',
        preferences: {
          analytics: true,
          functional: false,
          timestamp: new Date().toISOString(),
        },
      })
    )

    render(
      <ConsentProvider>
        <ConsentManager />
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
    expect(initializeAnalytics).toHaveBeenCalledWith(
      expect.objectContaining({
        analytics: true,
        functional: false,
      })
    )
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
      </ConsentProvider>
    )

    // Banner should be shown due to version mismatch
    await waitFor(() => {
      expect(screen.getByText('We value your privacy')).toBeInTheDocument()
    })
  })
})
