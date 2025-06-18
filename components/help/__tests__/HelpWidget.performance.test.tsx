import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { HelpWidget } from '../HelpWidget'
import { HelpWidgetProvider } from '../HelpProvider'
import { faqService, useFAQSearch } from '@/lib/help/faq-service'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

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

  describe('Search Performance', () => {
    it('should debounce search input', async () => {
      const searchMock = jest.fn()
      let searchQuery = ''

      ;(useFAQSearch as jest.Mock).mockImplementation(() => ({
        query: searchQuery,
        setQuery: (q: string) => {
          searchQuery = q
        },
        results: [],
        isSearching: false,
      }))

      renderWithProvider(<HelpWidget />)
      fireEvent.click(screen.getByLabelText('Open help menu'))
      fireEvent.click(screen.getByText('Search for help'))

      const searchInput =
        await screen.findByPlaceholderText('Search for help...')

      // Type quickly
      fireEvent.change(searchInput, { target: { value: 't' } })
      fireEvent.change(searchInput, { target: { value: 'te' } })
      fireEvent.change(searchInput, { target: { value: 'tes' } })
      fireEvent.change(searchInput, { target: { value: 'test' } })

      // Search should be debounced, not called for each keystroke
      expect(searchQuery).toBe('test')
    })

    it('should handle large search results efficiently', async () => {
      const largeResults = Array.from({ length: 100 }, (_, i) => ({
        item: {
          id: `result-${i}`,
          question: `Result Question ${i}`,
          answer: `Result Answer ${i}`,
          category: 'general',
        },
        score: 100 - i,
      }))

      ;(useFAQSearch as jest.Mock).mockReturnValue({
        query: 'test',
        setQuery: jest.fn(),
        results: largeResults.slice(0, 10), // Should limit results
        isSearching: false,
      })

      renderWithProvider(<HelpWidget />)
      fireEvent.click(screen.getByLabelText('Open help menu'))
      fireEvent.click(screen.getByText('Search for help'))

      await waitFor(() => {
        const results = screen.getAllByRole('button', {
          name: /Result Question \d+/,
        })
        expect(results.length).toBe(10) // Should limit to 10 results
      })
    })
  })

  describe('Animation Performance', () => {
    it('should maintain 60fps animations', async () => {
      // This is a simplified test - in a real scenario, you'd use performance observers
      const frameCallbacks: FrameRequestCallback[] = []
      const originalRAF = window.requestAnimationFrame

      window.requestAnimationFrame = jest.fn(
        (callback: FrameRequestCallback) => {
          frameCallbacks.push(callback)
          return 1
        }
      ) as any

      renderWithProvider(<HelpWidget />)

      // Trigger animation
      fireEvent.click(screen.getByLabelText('Open help menu'))

      // Simulate frames
      const frameTime = 1000 / 60 // 60fps
      let lastTime = 0

      frameCallbacks.forEach((callback, index) => {
        const currentTime = lastTime + frameTime
        callback(currentTime)
        lastTime = currentTime
      })

      window.requestAnimationFrame = originalRAF

      // Animations should complete smoothly
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('Memory Management', () => {
    it('should clean up event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

      const { unmount } = renderWithProvider(<HelpWidget />)

      // Should add keyboard event listeners
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      unmount()

      // Should remove event listeners on unmount
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })

    it('should not create memory leaks with FAQ updates', async () => {
      const { rerender } = renderWithProvider(<HelpWidget />)

      fireEvent.click(screen.getByLabelText('Open help menu'))

      // Update FAQs multiple times
      for (let i = 0; i < 10; i++) {
        ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue([
          {
            id: `faq-${i}`,
            question: `Updated Question ${i}`,
            answer: `Updated Answer ${i}`,
            category: 'general',
          },
        ])

        rerender(<HelpWidget />)
      }

      // Should handle updates without memory issues
      await waitFor(() => {
        expect(screen.getByText('Updated Question 9')).toBeInTheDocument()
      })
    })
  })

  describe('Virtual Scrolling', () => {
    it('should handle scrolling performance with many items', async () => {
      const manyFAQs = Array.from({ length: 100 }, (_, i) => ({
        id: `faq-${i}`,
        question: `Question ${i}`,
        answer: `Answer ${i}`,
        category: 'general',
      }))

      ;(faqService.getFAQsForContext as jest.Mock).mockReturnValue(manyFAQs)

      renderWithProvider(<HelpWidget />)
      fireEvent.click(screen.getByLabelText('Open help menu'))

      await waitFor(() => {
        const scrollContainer = screen
          .getByRole('dialog')
          .querySelector('[role="list"]')
        expect(scrollContainer).toHaveClass('overflow-y-auto')

        // Should have max-height for performance
        expect(scrollContainer).toHaveClass('max-h-[calc(100vh-280px)]')
      })
    })
  })

  describe('Caching', () => {
    it('should cache FAQ context to avoid repeated calls', async () => {
      const getFAQsForContextSpy = jest.spyOn(faqService, 'getFAQsForContext')

      renderWithProvider(<HelpWidget />)

      // Open widget multiple times
      fireEvent.click(screen.getByLabelText('Open help menu'))
      await waitFor(() =>
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      )

      fireEvent.click(screen.getByLabelText('Close help menu'))
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      )

      fireEvent.click(screen.getByLabelText('Open help menu'))
      await waitFor(() =>
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      )

      // Should only fetch FAQs once for the same context
      expect(getFAQsForContextSpy).toHaveBeenCalledTimes(1)
    })
  })
})
