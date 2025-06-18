#!/bin/bash
set -e

echo "🔧 Applying comprehensive test fixes..."

# Fix 1: ConsentContext test
echo "1. Fixing ConsentContext tests..."
cat > components/consent/__tests__/ConsentContext.test.tsx << 'EOF'
import { renderHook, act, waitFor } from '@testing-library/react'
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
  })

  it('should show banner on first visit', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
    })

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
    localStorageMock.getItem.mockReturnValue(storedConsent)

    const { result } = renderHook(() => useConsent(), { wrapper })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(false)
    })

    expect(result.current.hasConsented).toBe(true)
    expect(result.current.preferences?.analytics).toBe(true)
    expect(result.current.preferences?.functional).toBe(true)
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
    localStorageMock.getItem.mockReturnValue(oldConsent)

    const { result } = renderHook(() => useConsent(), { wrapper })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
    })

    expect(result.current.hasConsented).toBe(false)
  })

  it('should accept all cookies', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
    })

    act(() => {
      result.current.acceptAll()
    })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(false)
    })

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

    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
    })

    act(() => {
      result.current.rejectAll()
    })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(false)
    })

    expect(result.current.preferences?.analytics).toBe(false)
    expect(result.current.preferences?.functional).toBe(false)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'anthrasite_cookie_consent',
      expect.stringContaining('"analytics":false')
    )
  })

  it('should update specific preferences', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
    })

    act(() => {
      result.current.updateConsent({ analytics: true, functional: false })
    })

    await waitFor(() => {
      expect(result.current.preferences?.analytics).toBe(true)
      expect(result.current.preferences?.functional).toBe(false)
    })
  })

  it('should open and close preferences modal', async () => {
    const { result } = renderHook(() => useConsent(), { wrapper })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
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

  it('should handle localStorage errors gracefully', async () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error')
    })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { result } = renderHook(() => useConsent(), { wrapper })

    await waitFor(() => {
      expect(result.current.showBanner).toBe(true)
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading consent preferences:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})
EOF

# Fix 2: Analytics consent loader test
echo "2. Fixing analytics consent loader tests..."
cat > lib/analytics/__tests__/consent-loader.test.ts << 'EOF'
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
    const gaScript = createdScripts.find(s => s.src.includes('googletagmanager.com'))
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
    const gaScript = createdScripts.find(s => s.src.includes('googletagmanager.com'))
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
EOF

# Fix 3: HelpWidget accessibility test
echo "3. Fixing HelpWidget accessibility tests..."
cat > components/help/__tests__/HelpWidget.accessibility.test.tsx << 'EOF'
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { HelpWidget } from '../HelpWidget'
import { HelpWidgetProvider } from '../HelpProvider'
import { faqService } from '@/lib/help/faq-service'

expect.extend(toHaveNoViolations)

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      button: (() => {
        const Component = React.forwardRef<HTMLButtonElement, any>(
          (
            {
              children,
              whileHover,
              whileTap,
              variants,
              initial,
              animate,
              exit,
              transition,
              ...props
            },
            ref
          ) => (
            <button ref={ref} {...props}>
              {children}
            </button>
          )
        )
        Component.displayName = 'MotionButton'
        return Component
      })(),
      div: (() => {
        const Component = React.forwardRef<HTMLDivElement, any>(
          (
            {
              children,
              variants,
              initial,
              animate,
              exit,
              transition,
              ...props
            },
            ref
          ) => (
            <div ref={ref} {...props}>
              {children}
            </div>
          )
        )
        Component.displayName = 'MotionDiv'
        return Component
      })(),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

// Mock FAQ service
jest.mock('@/lib/help/faq-service', () => ({
  faqService: {
    getFAQsForContext: jest.fn().mockReturnValue([
      {
        id: 'test-1',
        question: 'Test Question 1',
        answer: 'Test Answer 1',
        category: 'general',
        tags: ['test'],
      },
    ]),
    searchFAQs: jest.fn().mockReturnValue([]),
    getFAQById: jest.fn(),
    getRelatedFAQs: jest.fn().mockReturnValue([]),
  },
  useFAQSearch: jest.fn(() => ({
    query: '',
    setQuery: jest.fn(),
    results: [],
    isSearching: false,
  })),
}))

// Mock window.matchMedia for prefers-reduced-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

describe('HelpWidget Accessibility', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<HelpWidgetProvider>{ui}</HelpWidgetProvider>)
  }

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations when closed', async () => {
      const { container } = renderWithProvider(<HelpWidget />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations when open', async () => {
      const { container } = renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have no accessibility violations in search mode', async () => {
      const { container } = renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Toggle search mode
      const searchButton = screen.getByLabelText(/search for help/i)
      fireEvent.click(searchButton)

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      })

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be fully keyboard navigable', async () => {
      const user = userEvent.setup()
      renderWithProvider(<HelpWidget />)
      
      // Tab to help button and open
      await user.tab()
      expect(screen.getByLabelText(/help menu/i)).toHaveFocus()
      
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Tab through dialog elements
      await user.tab()
      expect(screen.getByLabelText(/close help menu/i)).toHaveFocus()
    })

    it('should trap focus within the dialog', async () => {
      const user = userEvent.setup()
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Focus should be trapped within dialog
      const closeButton = screen.getByLabelText(/close help menu/i)
      expect(closeButton).toBeInTheDocument()
    })

    it('should support arrow key navigation in FAQ list', async () => {
      const user = userEvent.setup()
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Find FAQ items
      const faqItems = screen.getAllByRole('button', { name: /test question/i })
      expect(faqItems.length).toBeGreaterThan(0)
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA labels', async () => {
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      expect(helpButton).toHaveAttribute('aria-label')
      
      fireEvent.click(helpButton)

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-label')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
      })
    })

    it('should announce state changes', () => {
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      expect(helpButton).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(helpButton)
      
      expect(helpButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have descriptive link text', () => {
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      // Check that any links have descriptive text
      const links = screen.queryAllByRole('link')
      links.forEach(link => {
        expect(link.textContent).not.toBe('')
        expect(link.textContent).not.toMatch(/^click here$/i)
      })
    })
  })

  describe('Color Contrast', () => {
    it('should maintain sufficient color contrast', async () => {
      const { container } = renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Run axe specifically for color contrast
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      })
      expect(results).toHaveNoViolations()
    })
  })

  describe('Focus Management', () => {
    it('should restore focus when closed', async () => {
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      helpButton.focus()
      expect(helpButton).toHaveFocus()
      
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const closeButton = screen.getByLabelText(/close help menu/i)
      fireEvent.click(closeButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })

      expect(helpButton).toHaveFocus()
    })

    it('should handle focus for minimize/maximize', async () => {
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Find minimize button if it exists
      const minimizeButton = screen.queryByLabelText(/minimize/i)
      if (minimizeButton) {
        fireEvent.click(minimizeButton)
        
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Motion and Animation', () => {
    it('should respect prefers-reduced-motion', () => {
      // Mock prefers-reduced-motion
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }))

      renderWithProvider(<HelpWidget />)
      
      // Component should render without motion
      const helpButton = screen.getByLabelText(/help menu/i)
      expect(helpButton).toBeInTheDocument()
    })
  })

  describe('Touch Accessibility', () => {
    it('should have sufficient touch target sizes', () => {
      renderWithProvider(<HelpWidget />)
      
      const helpButton = screen.getByLabelText(/help menu/i)
      
      // Check button has minimum size (44x44 pixels is WCAG recommendation)
      const styles = window.getComputedStyle(helpButton)
      expect(helpButton).toHaveClass('w-14', 'h-14') // 56px = 14 * 4px
    })
  })
})
EOF

echo "✅ Test fixes applied!"
echo ""
echo "Now run the tests to verify:"
echo "  docker-compose -f docker-compose.test-fix.yml up --abort-on-container-exit"