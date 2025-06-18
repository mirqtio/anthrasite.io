import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HelpWidget } from '../HelpWidget'
import { HelpWidgetProvider } from '../HelpProvider'
import { faqService } from '@/lib/help/faq-service'
import { FAQItem, PageContext } from '@/lib/help/types'

// Mock framer-motion to avoid animation issues in tests
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
    getFAQsForContext: jest.fn(),
    searchFAQs: jest.fn(),
    getFAQById: jest.fn(),
    getRelatedFAQs: jest.fn(),
  },
  useFAQSearch: jest.fn(() => ({
    query: '',
    setQuery: jest.fn(),
    results: [],
    isSearching: false,
  })),
}))

// Mock window.location
const mockLocation = {
  pathname: '/',
}
try {
  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
    configurable: true,
  })
} catch (e) {
  // Location already defined, skip
}

describe('HelpWidget', () => {
  const mockFAQs: FAQItem[] = [
    {
      id: 'test-1',
      question: 'Test Question 1',
      answer: 'Test Answer 1',
      category: 'general' as any,
      tags: ['test'],
    },
    {
      id: 'test-2',
      question: 'Test Question 2',
      answer: 'Test Answer 2',
      category: 'general' as any,
      tags: ['test'],
      relatedQuestions: ['test-1'],
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue(mockFAQs)
    ;(faqService.getFAQById as jest.Mock).mockImplementation((id) =>
      mockFAQs.find((faq) => faq.id === id)
    )
    ;(faqService.getRelatedFAQs as jest.Mock).mockReturnValue([mockFAQs[0]])
  })

  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<HelpWidgetProvider>{ui}</HelpWidgetProvider>)
  }

  describe('Rendering', () => {
    it('should render the help button when closed', () => {
      renderWithProvider(<HelpWidget />)

      const helpButton = screen.getByLabelText('Open help menu')
      expect(helpButton).toBeInTheDocument()
      expect(helpButton).toHaveClass('bg-anthracite-blue')
    })

    it('should open the help panel when button is clicked', async () => {
      renderWithProvider(<HelpWidget />)

      const helpButton = screen.getByLabelText('Open help menu')
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Quick Help')).toBeInTheDocument()
      })
    })

    it('should display context-specific FAQs', async () => {
      renderWithProvider(<HelpWidget />)

      const helpButton = screen.getByLabelText('Open help menu')
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByText('Test Question 1')).toBeInTheDocument()
        expect(screen.getByText('Test Question 2')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('should open with "?" shortcut', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.keyDown(window, { key: '?', shiftKey: true })

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should close with Escape key', async () => {
      renderWithProvider(<HelpWidget />)

      // Open the widget
      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Close with Escape
      fireEvent.keyDown(window, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should open search with "/" key', async () => {
      renderWithProvider(<HelpWidget />)

      // Open the widget
      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Open search
      fireEvent.keyDown(window, { key: '/' })

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search for help...')
        ).toBeInTheDocument()
      })
    })
  })

  describe('FAQ Interaction', () => {
    it('should expand FAQ when clicked', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        const faqButton = screen.getByText('Test Question 1')
        fireEvent.click(faqButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Answer 1')).toBeInTheDocument()
      })
    })

    it('should show related questions', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        const faqButton = screen.getByText('Test Question 2')
        fireEvent.click(faqButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Answer 2')).toBeInTheDocument()
        expect(screen.getByText('Related questions')).toBeInTheDocument()
      })
    })

    it('should navigate back from FAQ detail', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      // Click on FAQ
      await waitFor(() => {
        fireEvent.click(screen.getByText('Test Question 1'))
      })

      // Click back button
      await waitFor(() => {
        const backButton = screen.getByText('Back to FAQs')
        fireEvent.click(backButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Quick Help')).toBeInTheDocument()
        expect(screen.queryByText('Test Answer 1')).not.toBeInTheDocument()
      })
    })
  })

  describe('Search Functionality', () => {
    it('should open search when search button is clicked', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        const searchButton = screen.getByText('Search for help')
        fireEvent.click(searchButton)
      })

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText('Search for help...')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Minimize/Maximize', () => {
    it('should minimize the widget', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        const minimizeButton = screen.getByLabelText('Minimize help menu')
        fireEvent.click(minimizeButton)
      })

      await waitFor(() => {
        // Content should be hidden when minimized
        expect(screen.queryByText('How can we help?')).toBeInTheDocument()
        expect(screen.queryByText('Test Question 1')).not.toBeInTheDocument()
      })
    })

    it('should maximize the widget after minimizing', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      // Minimize
      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('Minimize help menu'))
      })

      // Maximize
      await waitFor(() => {
        const maximizeButton = screen.getByLabelText('Expand help menu')
        fireEvent.click(maximizeButton)
      })

      await waitFor(() => {
        expect(screen.getByText('Test Question 1')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderWithProvider(<HelpWidget />)

      expect(screen.getByLabelText('Open help menu')).toBeInTheDocument()

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveAttribute(
          'aria-label',
          'Help menu'
        )
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
      })
    })

    it('should manage focus properly', async () => {
      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        const dialog = screen.getByRole('dialog')
        const focusableElements = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        expect(focusableElements.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Context Awareness', () => {
    it('should load purchase-specific FAQs on purchase page', async () => {
      mockLocation.pathname = '/purchase'

      const purchaseFAQs: FAQItem[] = [
        {
          id: 'purchase-1',
          question: 'How much does it cost?',
          answer: '$79',
          category: 'purchase' as any,
        },
      ]

      ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue(purchaseFAQs)

      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        expect(screen.getByText('How much does it cost?')).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('should lazy load search results', async () => {
      const searchMock = jest.fn().mockResolvedValue([])
      ;(faqService.searchFAQs as jest.Mock) = searchMock

      renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      // Verify search is not called initially
      expect(searchMock).not.toHaveBeenCalled()
    })
  })
})
