import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WaitlistForm } from '../WaitlistForm'

// Mock fetch
global.fetch = jest.fn()

// Mock monitoring
jest.mock('@/lib/monitoring', () => ({
  trackEvent: jest.fn(),
}))

jest.mock('@/lib/monitoring/hooks', () => ({
  useRenderTracking: jest.fn(),
}))

describe('WaitlistForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockReset()
  })

  it('should render domain input initially', () => {
    render(<WaitlistForm />)

    expect(
      screen.getByLabelText(/enter your website domain/i)
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example.com')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continue/i })
    ).toBeInTheDocument()
  })

  it('should validate domain on input with debounce', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, normalizedDomain: 'example.com' }),
    } as Response)

    render(<WaitlistForm />)
    const input = screen.getByPlaceholderText('example.com')

    await userEvent.type(input, 'example.com')

    // Wait for debounce
    await waitFor(
      () => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/waitlist/validate-domain',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ domain: 'example.com' }),
          })
        )
      },
      { timeout: 1000 }
    )
  })

  it('should show error for invalid domain', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid domain format' }),
    } as Response)

    render(<WaitlistForm />)
    const input = screen.getByPlaceholderText('example.com')

    await userEvent.type(input, 'invalid')

    await waitFor(() => {
      expect(screen.getByText('Invalid domain format')).toBeInTheDocument()
    })

    // Continue button should be disabled
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('should show suggestion for domain typos', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid domain',
        suggestion: 'gmail.com',
      }),
    } as Response)

    render(<WaitlistForm />)
    const input = screen.getByPlaceholderText('example.com')

    await userEvent.type(input, 'gmial.com')

    await waitFor(() => {
      expect(screen.getByText(/did you mean/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'gmail.com' })
      ).toBeInTheDocument()
    })
  })

  it('should use suggestion when clicked', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

    // First call returns error with suggestion
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid domain',
        suggestion: 'gmail.com',
      }),
    } as Response)

    // Second call (after using suggestion) returns success
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, normalizedDomain: 'gmail.com' }),
    } as Response)

    render(<WaitlistForm />)
    const input = screen.getByPlaceholderText('example.com')

    await userEvent.type(input, 'gmial.com')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'gmail.com' })
      ).toBeInTheDocument()
    })

    // Click suggestion
    fireEvent.click(screen.getByRole('button', { name: 'gmail.com' }))

    // Input should update
    expect(input).toHaveValue('gmail.com')

    // Should revalidate
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should progress to email step after valid domain', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, normalizedDomain: 'example.com' }),
    } as Response)

    render(<WaitlistForm />)
    const input = screen.getByPlaceholderText('example.com')

    await userEvent.type(input, 'example.com')

    // Wait for validation
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).not.toBeDisabled()
    })

    // Click continue
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Should show email step
    await waitFor(() => {
      expect(screen.getByLabelText(/enter your email/i)).toBeInTheDocument()
      expect(screen.getByText(/great! we'll analyze/i)).toBeInTheDocument()
      expect(screen.getByText('example.com')).toBeInTheDocument()
    })
  })

  it('should handle waitlist signup', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

    // Mock based on URL
    mockFetch.mockImplementation(async (url) => {
      if (url === '/api/waitlist/validate-domain') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            normalizedDomain: 'example.com',
          }),
        } as Response
      }
      if (url === '/api/waitlist') {
        return {
          ok: true,
          json: async () => ({
            success: true,
            normalizedDomain: 'example.com',
            position: {
              position: 42,
              totalCount: 100,
              estimatedDate: '2024-03-01T00:00:00Z',
            },
          }),
        } as Response
      }
      throw new Error(`Unexpected fetch to ${url}`)
    })

    render(<WaitlistForm />)

    // Enter domain
    const domainInput = screen.getByPlaceholderText('example.com')
    await userEvent.type(domainInput, 'example.com')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Enter email
    await waitFor(() => {
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    })

    const emailInput = screen.getByPlaceholderText('you@example.com')
    await userEvent.type(emailInput, 'test@example.com')

    fireEvent.click(screen.getByRole('button', { name: /join waitlist/i }))

    // Should show success
    await waitFor(
      () => {
        expect(screen.getByText(/you're on the list!/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText(/out of 100/i)).toBeInTheDocument()
    // Date formatting may vary, just check that estimated date is shown
    expect(screen.getByText(/estimated access:/i)).toBeInTheDocument()
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
  })

  it('should handle back button in email step', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, normalizedDomain: 'example.com' }),
    } as Response)

    render(<WaitlistForm />)

    // Enter domain and continue
    const domainInput = screen.getByPlaceholderText('example.com')
    await userEvent.type(domainInput, 'example.com')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Should be on email step
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    // Click back
    fireEvent.click(screen.getByRole('button', { name: /back/i }))

    // Should be back on domain step
    expect(screen.getByPlaceholderText('example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('example.com')).toHaveValue(
      'example.com'
    )
  })

  it('should handle signup errors', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

    // First domain validation
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, normalizedDomain: 'example.com' }),
    } as Response)

    // Waitlist signup fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Unable to add to waitlist. Please try again.',
      }),
    } as Response)

    render(<WaitlistForm />)

    // Complete domain step
    const domainInput = screen.getByPlaceholderText('example.com')
    await userEvent.type(domainInput, 'example.com')

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue/i })
      ).not.toBeDisabled()
    })

    fireEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Enter email and submit
    await waitFor(() => {
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    })

    const emailInput = screen.getByPlaceholderText('you@example.com')
    await userEvent.type(emailInput, 'test@example.com')

    fireEvent.click(screen.getByRole('button', { name: /join waitlist/i }))

    // Should show error below email input
    await waitFor(
      () => {
        const errorElement = screen.getByText(
          'Unable to add to waitlist. Please try again.'
        )
        expect(errorElement).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
