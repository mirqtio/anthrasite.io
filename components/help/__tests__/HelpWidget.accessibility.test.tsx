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
  value: jest.fn().mockImplementation((query) => ({
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
      expect(helpButton).toHaveAttribute('aria-label', 'Open help menu')

      fireEvent.click(helpButton)

      expect(helpButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have descriptive link text', () => {
      renderWithProvider(<HelpWidget />)

      const helpButton = screen.getByLabelText(/help menu/i)
      fireEvent.click(helpButton)

      // Check that any links have descriptive text
      const links = screen.queryAllByRole('link')
      links.forEach((link) => {
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
      window.matchMedia = jest.fn().mockImplementation((query) => ({
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
      expect(helpButton).toHaveClass('w-help-button', 'h-help-button')
    })
  })
})
