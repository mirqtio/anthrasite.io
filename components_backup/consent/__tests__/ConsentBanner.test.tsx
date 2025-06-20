import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConsentBanner } from '../ConsentBanner'
import { ConsentProvider } from '@/lib/context/ConsentContext'

// Mock the analytics module
jest.mock('@/lib/analytics/consent-loader')

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConsentProvider>{children}</ConsentProvider>
)

describe('ConsentBanner', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should render banner when no consent is given', async () => {
    render(<ConsentBanner />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(screen.getByText('We value your privacy')).toBeInTheDocument()
      expect(screen.getByText(/We use cookies to enhance/)).toBeInTheDocument()
    })
  })

  it('should have all action buttons', async () => {
    render(<ConsentBanner />, { wrapper: TestWrapper })

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Accept all cookies' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Reject all cookies' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Manage cookie preferences' })
      ).toBeInTheDocument()
    })
  })

  it('should hide banner when accept all is clicked', async () => {
    render(<ConsentBanner />, { wrapper: TestWrapper })

    const acceptButton = await screen.findByRole('button', {
      name: 'Accept all cookies',
    })
    fireEvent.click(acceptButton)

    await waitFor(() => {
      expect(
        screen.queryByText('We value your privacy')
      ).not.toBeInTheDocument()
    })
  })

  it('should hide banner when reject all is clicked', async () => {
    render(<ConsentBanner />, { wrapper: TestWrapper })

    const rejectButton = await screen.findByRole('button', {
      name: 'Reject all cookies',
    })
    fireEvent.click(rejectButton)

    await waitFor(() => {
      expect(
        screen.queryByText('We value your privacy')
      ).not.toBeInTheDocument()
    })
  })

  it('should be accessible', async () => {
    render(<ConsentBanner />, { wrapper: TestWrapper })

    await waitFor(() => {
      const banner = screen.getByRole('region', { name: 'Cookie consent' })
      expect(banner).toBeInTheDocument()
      expect(banner).toHaveAttribute('aria-live', 'polite')
    })
  })

  it('should be responsive', async () => {
    render(<ConsentBanner />, { wrapper: TestWrapper })

    await waitFor(() => {
      const heading = screen.getByText('We value your privacy')
      const container = heading.closest('.flex-col.lg\\:flex-row')
      expect(container).toBeInTheDocument()
    })
  })

  it('should not render when consent is already given', async () => {
    localStorage.setItem(
      'anthrasite_cookie_consent',
      JSON.stringify({
        version: '1.0',
        preferences: {
          analytics: true,
          functional: true,
          timestamp: new Date().toISOString(),
        },
      })
    )

    render(<ConsentBanner />, { wrapper: TestWrapper })

    // Wait a bit for the component to process the stored consent
    await waitFor(
      () => {
        expect(
          screen.queryByText('We value your privacy')
        ).not.toBeInTheDocument()
      },
      { timeout: 1000 }
    )
  })
})
