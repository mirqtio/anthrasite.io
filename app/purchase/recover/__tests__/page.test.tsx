import { render, screen, waitFor } from '@testing-library/react'
import RecoverPage from '../page'

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
const mockSearchParams = new Map()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key),
  }),
  redirect: jest.fn(),
}))

// Mock analytics
jest.mock('@/lib/analytics/analytics-client', () => ({
  trackEvent: jest.fn(),
}))

// Mock global fetch
global.fetch = jest.fn()

describe('RecoverPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.clear()
    ;(global.fetch as jest.Mock).mockReset()
  })

  it('should redirect to homepage if no token provided', async () => {
    // Don't set any search params (no utm)
    render(<RecoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Invalid Recovery Link')).toBeInTheDocument()
    })
  })

  it('should show invalid recovery link message for invalid token', async () => {
    mockSearchParams.set('utm', 'invalid-token')
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid recovery token' }),
    })

    render(<RecoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Recovery Failed')).toBeInTheDocument()
    })

    expect(screen.getByText(/Invalid recovery token/)).toBeInTheDocument()
  })

  it('should show already recovered message for recovered carts', async () => {
    mockSearchParams.set('utm', 'recovery-token')
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Session already recovered' }),
    })

    render(<RecoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Recovery Failed')).toBeInTheDocument()
    })

    expect(screen.getByText(/Session already recovered/)).toBeInTheDocument()
  })

  it('should show session expired message for expired sessions', async () => {
    mockSearchParams.set('utm', 'recovery-token')
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Session expired' }),
    })

    render(<RecoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Recovery Failed')).toBeInTheDocument()
    })

    expect(screen.getByText(/Session expired/)).toBeInTheDocument()
  })

  it('should show session not found message when Stripe session is missing', async () => {
    mockSearchParams.set('utm', 'recovery-token')
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Session not found' }),
    })

    render(<RecoverPage />)

    await waitFor(() => {
      expect(screen.getByText('Recovery Failed')).toBeInTheDocument()
    })

    expect(screen.getByText(/Session not found/)).toBeInTheDocument()
  })

  it('should redirect to Stripe checkout for valid recovery', async () => {
    // Mock setTimeout to prevent actual redirect
    jest.useFakeTimers()

    mockSearchParams.set('utm', 'recovery-token')
    mockSearchParams.set('session', 'cs_test_123')
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        sessionUrl: 'https://checkout.stripe.com/pay/cs_test_123',
        sessionId: 'cs_test_123',
      }),
    })

    render(<RecoverPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Redirecting you to checkout...')
      ).toBeInTheDocument()
    })

    // Verify success state is shown
    expect(screen.getByText('Session Recovered!')).toBeInTheDocument()

    // Cleanup timers
    jest.useRealTimers()
  })
})
