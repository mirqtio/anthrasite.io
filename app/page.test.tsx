import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import HomePage from './page'
import { useSiteMode } from '@/lib/context/SiteModeContext'

// Mock the SiteModeContext
jest.mock('@/lib/context/SiteModeContext', () => ({
  useSiteMode: jest.fn(),
}))

// Mock next/dynamic to load components synchronously in tests
jest.mock('next/dynamic', () => (func: () => any) => {
  const Component = (props: any) => {
    const [Comp, setComp] = React.useState<any>(null)
    React.useEffect(() => {
      func().then((mod: any) => setComp(() => mod))
    }, [])
    return Comp ? <Comp {...props} /> : null
  }
  return Component
})

// Mock the homepage components
jest.mock('@/components/homepage/OrganicHomepage', () => ({
  OrganicHomepage: () => (
    <div data-testid="organic-homepage">Organic Homepage</div>
  ),
}))

jest.mock('@/components/homepage/PurchaseHomepage', () => ({
  PurchaseHomepage: () => (
    <div data-testid="purchase-homepage">Purchase Homepage</div>
  ),
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
    expect(loadingContainer).toHaveClass(
      'min-h-screen',
      'bg-carbon',
      'flex',
      'items-center',
      'justify-center'
    )

    // Check for the animated square
    const animatedSquare = loadingContainer.querySelector('.bg-white')
    expect(animatedSquare).toBeInTheDocument()
    expect(animatedSquare).toHaveClass('w-8', 'h-8', 'animate-pulse')

    // Ensure no homepage components are rendered
    expect(screen.queryByTestId('organic-homepage')).not.toBeInTheDocument()
    expect(screen.queryByTestId('purchase-homepage')).not.toBeInTheDocument()
  })

  it('renders OrganicHomepage when mode is organic', async () => {
    mockUseSiteMode.mockReturnValue({
      mode: 'organic',
      businessId: null,
      isLoading: false,
    })

    render(<HomePage />)

    // Wait for dynamic import to resolve
    await waitFor(() => {
      const organicHomepage = screen.getByTestId('organic-homepage')
      expect(organicHomepage).toBeInTheDocument()
    })

    // Ensure PurchaseHomepage is not rendered
    expect(screen.queryByTestId('purchase-homepage')).not.toBeInTheDocument()
  })

  it('renders PurchaseHomepage when mode is purchase', async () => {
    mockUseSiteMode.mockReturnValue({
      mode: 'purchase',
      businessId: 'test-business-123',
      isLoading: false,
    })

    render(<HomePage />)

    // Wait for dynamic import to resolve
    await waitFor(() => {
      const purchaseHomepage = screen.getByTestId('purchase-homepage')
      expect(purchaseHomepage).toBeInTheDocument()
    })

    // Ensure OrganicHomepage is not rendered
    expect(screen.queryByTestId('organic-homepage')).not.toBeInTheDocument()
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
