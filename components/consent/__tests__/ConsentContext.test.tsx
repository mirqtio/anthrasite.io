import { renderHook, act } from '@testing-library/react'
import { ConsentProvider, useConsent } from '@/lib/context/ConsentContext'
import { ReactNode } from 'react'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock window.dispatchEvent
const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')

describe('ConsentContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ConsentProvider>{children}</ConsentProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should show banner on first visit', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for useEffect to complete
    act(() => {
      jest.runAllTimers()
    })

    expect(result.current.showBanner).toBe(true)
    expect(result.current.hasConsented).toBe(false)
    expect(result.current.preferences).toBe(null)
  })

  it('should not show banner if consent already given', () => {
    const storedConsent = JSON.stringify({
      version: '1.0',
      preferences: {
        analytics: true,
        functional: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    })
    localStorageMock.getItem.mockReturnValue(storedConsent)

    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      jest.runAllTimers()
    })

    expect(result.current.showBanner).toBe(false)
    expect(result.current.hasConsented).toBe(true)
    expect(result.current.preferences?.analytics).toBe(true)
    expect(result.current.preferences?.functional).toBe(true)
  })

  it('should show banner if consent version mismatch', () => {
    const oldConsent = JSON.stringify({
      version: '0.9',
      preferences: {
        analytics: true,
        functional: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    })
    localStorageMock.getItem.mockReturnValue(oldConsent)

    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      jest.runAllTimers()
    })

    expect(result.current.showBanner).toBe(true)
    expect(result.current.hasConsented).toBe(false)
  })

  it('should accept all cookies', () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      jest.runAllTimers()
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

  it('should reject all cookies', () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      jest.runAllTimers()
    })

    act(() => {
      result.current.rejectAll()
    })

    expect(result.current.showBanner).toBe(false)
    expect(result.current.preferences?.analytics).toBe(false)
    expect(result.current.preferences?.functional).toBe(false)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'anthrasite_cookie_consent',
      expect.stringContaining('"analytics":false')
    )
  })

  it('should update specific preferences', () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      jest.runAllTimers()
    })

    act(() => {
      result.current.updateConsent({ analytics: true, functional: false })
    })

    expect(result.current.preferences?.analytics).toBe(true)
    expect(result.current.preferences?.functional).toBe(false)
  })

  it('should open and close preferences modal', () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    act(() => {
      jest.runAllTimers()
    })

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

    act(() => {
      jest.runAllTimers()
    })

    expect(result.current.showBanner).toBe(true)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading consent preferences:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})
