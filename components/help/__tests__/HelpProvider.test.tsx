import React from 'react'
import { render, screen, act, renderHook } from '@testing-library/react'
import {
  HelpWidgetProvider,
  useHelpWidget,
  useHelpWidgetAvailable,
} from '../HelpProvider'
import { DEFAULT_HELP_CONFIG } from '@/lib/help/types'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock dataLayer for analytics
Object.defineProperty(window, 'dataLayer', {
  value: [],
  writable: true,
})

describe('HelpWidgetProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    window.dataLayer = []
  })

  describe('Provider Rendering', () => {
    it('should render children', () => {
      render(
        <HelpWidgetProvider>
          <div>Test Child</div>
        </HelpWidgetProvider>
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })

    it('should render children when disabled', () => {
      render(
        <HelpWidgetProvider enabled={false}>
          <div>Test Child</div>
        </HelpWidgetProvider>
      )

      expect(screen.getByText('Test Child')).toBeInTheDocument()
    })
  })

  describe('useHelpWidget Hook', () => {
    it('should provide default values', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      expect(result.current.isOpen).toBe(false)
      expect(result.current.isMinimized).toBe(false)
      expect(result.current.config).toEqual(DEFAULT_HELP_CONFIG)
    })

    it('should throw error when used outside provider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useHelpWidget())
      }).toThrow('useHelpWidget must be used within a HelpWidgetProvider')

      consoleError.mockRestore()
    })

    it('should update isOpen state', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.setIsOpen(true)
      })

      expect(result.current.isOpen).toBe(true)
      expect(window.dataLayer).toContainEqual({
        event: 'help_widget_toggle',
        help_widget_open: true,
      })
    })

    it('should update isMinimized state', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.setIsMinimized(true)
      })

      expect(result.current.isMinimized).toBe(true)
    })

    it('should update config', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.updateConfig({ position: 'top-left' })
      })

      expect(result.current.config.position).toBe('top-left')
      expect(result.current.config.enableSearch).toBe(
        DEFAULT_HELP_CONFIG.enableSearch
      )
    })

    it('should update state', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.updateState({ searchQuery: 'test query' })
      })

      expect(result.current.state.searchQuery).toBe('test query')
    })
  })

  describe('useHelpWidgetAvailable Hook', () => {
    it('should return true when inside provider', () => {
      const { result } = renderHook(() => useHelpWidgetAvailable(), {
        wrapper: HelpWidgetProvider,
      })

      expect(result.current).toBe(true)
    })

    it('should return false when outside provider', () => {
      const { result } = renderHook(() => useHelpWidgetAvailable())

      expect(result.current).toBe(false)
    })
  })

  describe('Initial Config', () => {
    it('should merge initial config with defaults', () => {
      const customConfig = {
        position: 'top-right' as const,
        maxSearchResults: 20,
      }

      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: ({ children }) => (
          <HelpWidgetProvider config={customConfig}>
            {children}
          </HelpWidgetProvider>
        ),
      })

      expect(result.current.config.position).toBe('top-right')
      expect(result.current.config.maxSearchResults).toBe(20)
      expect(result.current.config.enableSearch).toBe(
        DEFAULT_HELP_CONFIG.enableSearch
      )
    })
  })

  describe('LocalStorage Persistence', () => {
    it('should save state to localStorage', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.setIsMinimized(true)
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'help-widget-state',
        JSON.stringify({
          isMinimized: true,
          hasUnreadNotifications: false,
        })
      )
    })

    it('should restore state from localStorage', () => {
      const savedState = {
        isMinimized: true,
        hasUnreadNotifications: true,
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState))

      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      expect(result.current.isMinimized).toBe(true)
      expect(result.current.state.hasUnreadNotifications).toBe(true)
    })

    it('should handle invalid localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      const consoleError = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      expect(result.current.isMinimized).toBe(false)
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to parse saved help widget state:',
        expect.any(Error)
      )

      consoleError.mockRestore()
    })
  })

  describe('Multiple Instance Prevention', () => {
    it('should warn about multiple instances', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation()

      // First instance
      const { unmount: unmount1 } = render(
        <HelpWidgetProvider>
          <div>Instance 1</div>
        </HelpWidgetProvider>
      )

      // Second instance
      render(
        <HelpWidgetProvider>
          <div>Instance 2</div>
        </HelpWidgetProvider>
      )

      expect(consoleWarn).toHaveBeenCalledWith(
        'Multiple HelpWidgetProvider instances detected. Only one instance should be used.'
      )

      unmount1()
      consoleWarn.mockRestore()
    })
  })

  describe('Analytics Integration', () => {
    it('should track widget open events', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.setIsOpen(true)
      })

      expect(window.dataLayer).toContainEqual({
        event: 'help_widget_toggle',
        help_widget_open: true,
      })
    })

    it('should track widget close events', () => {
      const { result } = renderHook(() => useHelpWidget(), {
        wrapper: HelpWidgetProvider,
      })

      act(() => {
        result.current.setIsOpen(false)
      })

      expect(window.dataLayer).toContainEqual({
        event: 'help_widget_toggle',
        help_widget_open: false,
      })
    })
  })
})
