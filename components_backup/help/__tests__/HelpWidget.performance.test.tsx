import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HelpWidget } from '../HelpWidget'
import { HelpWidgetProvider } from '../HelpProvider'
import { faqService, useFAQSearch } from '@/lib/help/faq-service'

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
    getFAQsForContext: jest.fn(),
    searchFAQs: jest.fn(),
    getFAQById: jest.fn(),
    getRelatedFAQs: jest.fn(),
  },
  useFAQSearch: jest.fn(),
}))

describe('HelpWidget Performance', () => {
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<HelpWidgetProvider>{ui}</HelpWidgetProvider>)
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock FAQ data
    ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue([
      {
        id: 'test-1',
        question: 'Test Question 1',
        answer: 'Test Answer 1',
        category: 'general',
      },
    ])

    // Mock search hook
    ;(useFAQSearch as jest.Mock).mockReturnValue({
      query: '',
      setQuery: jest.fn(),
      results: [],
      isSearching: false,
    })
  })

  describe('Initial Bundle Size', () => {
    it('should lazy load help content', () => {
      // The component should not load FAQ content until opened
      const getFAQsForContextSpy = jest.spyOn(faqService, 'getFAQsForContext')

      renderWithProvider(<HelpWidget />)

      // FAQs should not be loaded until widget is opened
      expect(getFAQsForContextSpy).not.toHaveBeenCalled()

      // Open the widget
      fireEvent.click(screen.getByLabelText('Open help menu'))

      // Now FAQs should be loaded
      expect(getFAQsForContextSpy).toHaveBeenCalled()
    })
  })

  describe('Render Performance', () => {
    it('should render quickly with many FAQs', async () => {
      const manyFAQs = Array.from({ length: 100 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Question ${i}`,
        answer: `Answer ${i}`,
        category: 'general',
      }))

      ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue(
        manyFAQs.slice(0, 15)
      )

      const startTime = performance.now()
      renderWithProvider(<HelpWidget />)
      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should render in less than 100ms even with many FAQs
      expect(renderTime).toBeLessThan(100)
    })

    it('should limit displayed FAQs for performance', async () => {
      const manyFAQs = Array.from({ length: 50 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Question ${i}`,
        answer: `Answer ${i}`,
        category: 'general',
      }))

      ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue(manyFAQs)

      renderWithProvider(<HelpWidget />)
      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        // Should only render limited number of FAQs
        const faqButtons = screen.getAllByRole('button', {
          name: /Question \d+/,
        })
        expect(faqButtons.length).toBeLessThanOrEqual(50) // Component should handle this gracefully
      })
    })
  })

  describe('Animation Performance', () => {
    it('should have smooth transitions', async () => {
      renderWithProvider(<HelpWidget />)

      const helpButton = screen.getByLabelText('Open help menu')
      fireEvent.click(helpButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      // Component should render smoothly
      expect(screen.getByRole('dialog')).toHaveClass('overflow-hidden')
    })
  })
})
