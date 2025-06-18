import { render, screen } from '@testing-library/react'
import { PurchaseHero } from '../PurchaseHero'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
}))

describe('PurchaseHero', () => {
  const defaultProps = {
    businessName: 'Test Company',
    domain: 'testcompany.com',
  }

  it('renders business name and domain', () => {
    render(<PurchaseHero {...defaultProps} />)

    expect(screen.getByText('Test Company')).toBeInTheDocument()
    expect(screen.getByText('testcompany.com')).toBeInTheDocument()
  })

  it('renders heading with business name', () => {
    render(<PurchaseHero {...defaultProps} />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent(
      'Your Website Audit Report for Test Company'
    )
  })

  it('renders back link', () => {
    render(<PurchaseHero {...defaultProps} />)

    const backLink = screen.getByRole('link', { name: /back to anthrasite/i })
    expect(backLink).toHaveAttribute('href', '/')
  })

  it('applies correct styling classes', () => {
    const { container } = render(<PurchaseHero {...defaultProps} />)

    const section = container.querySelector('section')
    expect(section).toHaveClass('bg-anthracite-black', 'text-white')
  })

  it('renders personalized content', () => {
    render(<PurchaseHero businessName="Acme Corp" domain="acme.com" />)

    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('acme.com')).toBeInTheDocument()
  })
})
