import { render, screen } from '@testing-library/react'
import { PurchaseHero } from '../PurchaseHero'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}))

// Mock Logo component
jest.mock('@/components/Logo', () => ({
  Logo: () => <div>Logo</div>,
}))

describe('PurchaseHero', () => {
  const defaultProps = {
    businessName: 'Test Company',
    domain: 'testcompany.com',
  }

  it('renders heading with business name', () => {
    render(<PurchaseHero {...defaultProps} />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(
      'Test Company, your audit is ready'
    )
  })

  it('renders subheading', () => {
    render(<PurchaseHero {...defaultProps} />)

    expect(screen.getByText("We've identified opportunities worth thousands")).toBeInTheDocument()
  })

  it('renders tagline', () => {
    render(<PurchaseHero {...defaultProps} />)

    expect(screen.getByText('VALUE, CRYSTALLIZED')).toBeInTheDocument()
  })

  it('applies correct test id', () => {
    const { container } = render(<PurchaseHero {...defaultProps} />)

    const header = screen.getByTestId('purchase-header')
    expect(header).toBeInTheDocument()
  })

  it('renders personalized content', () => {
    render(<PurchaseHero businessName="Acme Corp" domain="acme.com" />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Acme Corp, your audit is ready')
  })
})
