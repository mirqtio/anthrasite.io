import { renderHook, act, waitFor } from '@testing-library/react'
import { ConsentProvider, useConsent } from '@/lib/context/ConsentContext'
import { ReactNode } from 'react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock window.dispatchEvent
const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')

// Set test environment
process.env.NODE_ENV = 'test'

describe('ConsentContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ConsentProvider>{children}</ConsentProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it('should show banner on first visit', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for the component to mount
    await waitFor(() => {
      expect(result.current.showBanner).toBeDefined()
    })

    expect(result.current.showBanner).toBe(true) // Banner should show on first visit
    expect(result.current.hasConsented).toBe(false)
    expect(result.current.preferences).toBe(null)
  })

  it('should not show banner if consent already given', async () => {
    const storedConsent = JSON.stringify({
      version: '1.0',
      preferences: {
        analytics: true,
        functional: true,
        marketing: true,
        performance: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    })
    localStorageMock.setItem('anthrasite_cookie_consent', storedConsent)

    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for localStorage to be read and state to update
    await waitFor(() => {
      expect(result.current.hasConsented).toBe(true)
    })

    expect(result.current.showBanner).toBe(false)
    expect(result.current.preferences?.analytics).toBe(true)
  })

  it('should show banner if consent version mismatch', async () => {
    const oldConsent = JSON.stringify({
      version: '0.9',
      preferences: {
        analytics: true,
        functional: true,
        marketing: true,
        performance: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    })
    localStorageMock.setItem('anthrasite_cookie_consent', oldConsent)

    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for initial render
    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    expect(result.current.showBanner).toBe(true) // Should show banner for version mismatch
    expect(result.current.hasConsented).toBe(false)
  })

  it('should accept all cookies', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    act(() => {
      result.current.acceptAll()
    })

    expect(result.current.showBanner).toBe(false)
    expect(result.current.preferences?.analytics).toBe(true)
    expect(result.current.preferences?.functional).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'anthrasite_cookie_consent',
      expect.stringContaining('"analytics":true')
    )
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'consentUpdated',
        detail: expect.objectContaining({
          analytics: true,
          functional: true,
        }),
      })
    )
  })

  it('should reject all cookies', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for initial load
    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    act(() => {
      result.current.rejectAll()
    })

    expect(result.current.showBanner).toBe(false)
    expect(result.current.preferences?.analytics).toBe(false)
    expect(result.current.preferences?.functional).toBe(true) // Functional is always true
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'anthrasite_cookie_consent',
      expect.stringContaining('"analytics":false')
    )
  })

  it('should update specific preferences', () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      result.current.updateConsent({ analytics: true, marketing: false })
    })

    expect(result.current.preferences?.analytics).toBe(true)
    expect(result.current.preferences?.marketing).toBe(false)
    expect(result.current.preferences?.functional).toBe(true) // Functional is always true
  })

  it('should open and close preferences modal', () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    expect(result.current.showPreferences).toBe(false)

    act(() => {
      result.current.openPreferences()
    })

    expect(result.current.showPreferences).toBe(true)

    act(() => {
      result.current.closePreferences()
    })

    expect(result.current.showPreferences).toBe(false)
  })

  it('should handle localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { result } = renderHook(() => useConsent(), { wrapper })

    // Should show banner when localStorage fails
    expect(result.current.showBanner).toBe(true)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading consent preferences:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})
