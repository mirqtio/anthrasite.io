import { render, screen } from '@testing-library/react'
import HomePage from './page'
import { useSiteMode } from '@/lib/context/SiteModeContext'

// Mock the SiteModeContext
jest.mock('@/lib/context/SiteModeContext', () => ({
  useSiteMode: jest.fn(),
}))

// Mock the homepage components
jest.mock('@/components/homepage/OrganicHomepage', () => ({
  OrganicHomepage: () => <div data-testid="organic-homepage">Organic Homepage</div>,
}))

jest.mock('@/components/homepage/PurchaseHomepage', () => ({
  PurchaseHomepage: () => <div data-testid="purchase-homepage">Purchase Homepage</div>,
}))

describe('HomePage', () => {
  const mockUseSiteMode = useSiteMode as jest.MockedFunction<typeof useSiteMode>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state when isLoading is true', () => {
    mockUseSiteMode.mockReturnValue({
      mode: 'organic',
      businessId: null,
      isLoading: true,
    })

    render(<HomePage />)

    // Check for loading state - now it's just an animated square
    const loadingContainer = screen.getByRole('main')
    expect(loadingContainer).toHaveClass('min-h-screen', 'bg-white', 'flex', 'items-center', 'justify-center')
    
    // Check for the animated square
    const animatedSquare = loadingContainer.querySelector('.bg-anthracite-black')
    expect(animatedSquare).toBeInTheDocument()
    expect(animatedSquare).toHaveClass('w-8', 'h-8', 'animate-pulse')

    // Ensure no homepage components are rendered
    expect(screen.queryByTestId('organic-homepage')).not.toBeInTheDocument()
    expect(screen.queryByTestId('purchase-homepage')).not.toBeInTheDocument()
  })

  it('renders OrganicHomepage when mode is organic', () => {
    mockUseSiteMode.mockReturnValue({
      mode: 'organic',
      businessId: null,
      isLoading: false,
    })

    render(<HomePage />)

    // Check that OrganicHomepage is rendered
    const organicHomepage = screen.getByTestId('organic-homepage')
    expect(organicHomepage).toBeInTheDocument()

    // Ensure PurchaseHomepage is not rendered
    expect(screen.queryByTestId('purchase-homepage')).not.toBeInTheDocument()

    // Ensure loading state is not shown
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('renders PurchaseHomepage when mode is purchase', () => {
    mockUseSiteMode.mockReturnValue({
      mode: 'purchase',
      businessId: 'test-business-123',
      isLoading: false,
    })

    render(<HomePage />)

    // Check that PurchaseHomepage is rendered
    const purchaseHomepage = screen.getByTestId('purchase-homepage')
    expect(purchaseHomepage).toBeInTheDocument()

    // Ensure OrganicHomepage is not rendered
    expect(screen.queryByTestId('organic-homepage')).not.toBeInTheDocument()

    // Ensure loading state is not shown
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  it('properly uses the SiteModeContext hook', () => {
    mockUseSiteMode.mockReturnValue({
      mode: 'organic',
      businessId: null,
      isLoading: false,
    })

    render(<HomePage />)

    // Verify that useSiteMode was called
    expect(mockUseSiteMode).toHaveBeenCalled()
  })
})