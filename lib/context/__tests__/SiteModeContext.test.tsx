import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SiteModeProvider, useSiteMode } from '../SiteModeContext'

// Mock URLSearchParams to control URL parameters
const originalURLSearchParams = global.URLSearchParams
let mockSearchParams: Record<string, string> = {}

beforeAll(() => {
  global.URLSearchParams = jest.fn().mockImplementation(() => ({
    get: (key: string) => mockSearchParams[key] || null,
  })) as jest.MockedClass<typeof URLSearchParams>
})

afterAll(() => {
  global.URLSearchParams = originalURLSearchParams
})

// Test component to access context
const TestComponent = () => {
  const { mode, businessId, isLoading } = useSiteMode()
  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="business-id">{businessId || 'none'}</div>
      <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
    </div>
  )
}

describe('SiteModeContext', () => {
  beforeEach(() => {
    // Reset mocks
    mockSearchParams = {}
    Object.defineProperty(document, 'cookie', {
      value: '',
      writable: true,
    })
  })

  it('should provide organic mode by default', async () => {
    render(
      <SiteModeProvider>
        <TestComponent />
      </SiteModeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('mode')).toHaveTextContent('organic')
    expect(screen.getByTestId('business-id')).toHaveTextContent('none')
  })

  it('should detect purchase mode from UTM parameter', async () => {
    mockSearchParams = { utm: 'test_utm_token' }

    render(
      <SiteModeProvider>
        <TestComponent />
      </SiteModeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('mode')).toHaveTextContent('purchase')
  })

  it('should detect purchase mode from cookies', async () => {
    document.cookie = 'site_mode=purchase; business_id=biz_123'

    render(
      <SiteModeProvider>
        <TestComponent />
      </SiteModeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('mode')).toHaveTextContent('purchase')
    expect(screen.getByTestId('business-id')).toHaveTextContent('biz_123')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useSiteMode must be used within SiteModeProvider')

    consoleSpy.mockRestore()
  })

  it('should start in loading state', async () => {
    // Create a custom test component that captures the initial state
    let capturedInitialState: string | null = null

    const InitialStateCapture = () => {
      const { isLoading } = useSiteMode()
      if (capturedInitialState === null) {
        capturedInitialState = isLoading ? 'loading' : 'loaded'
      }
      return (
        <div>
          <div data-testid="loading">{isLoading ? 'loading' : 'loaded'}</div>
        </div>
      )
    }

    render(
      <SiteModeProvider>
        <InitialStateCapture />
      </SiteModeProvider>
    )

    // Should have captured the initial loading state
    expect(capturedInitialState).toBe('loading')

    // And eventually should be loaded
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })
  })

  it('should handle initial props', async () => {
    render(
      <SiteModeProvider initialMode="purchase" initialBusinessId="biz_initial">
        <TestComponent />
      </SiteModeProvider>
    )

    expect(screen.getByTestId('mode')).toHaveTextContent('purchase')
    expect(screen.getByTestId('business-id')).toHaveTextContent('biz_initial')
  })

  it('should prioritize UTM parameter over cookies', async () => {
    mockSearchParams = { utm: 'test_utm_token' }
    document.cookie = 'site_mode=organic; business_id=biz_123'

    render(
      <SiteModeProvider>
        <TestComponent />
      </SiteModeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    expect(screen.getByTestId('mode')).toHaveTextContent('purchase')
    // Business ID should be null since UTM doesn't provide it
    expect(screen.getByTestId('business-id')).toHaveTextContent('none')
  })

  it('should handle cookie parsing edge cases', async () => {
    // Cookie with spaces and missing values
    document.cookie = ' site_mode = purchase ; business_id= ; other=value '

    render(
      <SiteModeProvider>
        <TestComponent />
      </SiteModeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded')
    })

    // Should fall back to organic mode when business_id is empty
    expect(screen.getByTestId('mode')).toHaveTextContent('organic')
  })
})
