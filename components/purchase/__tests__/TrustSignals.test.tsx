import { render, screen } from '@testing-library/react'
import { TrustSignals } from '../TrustSignals'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      transition,
      whileInView,
      viewport,
      ...props
    }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('TrustSignals', () => {
  it('renders trust badges', () => {
    render(<TrustSignals />)

    expect(screen.getByText('Enterprise Grade')).toBeInTheDocument()
    expect(screen.getByText('SSL Encrypted')).toBeInTheDocument()
    expect(screen.getByText('100% Guarantee')).toBeInTheDocument()
    expect(screen.getByText('24 Hour')).toBeInTheDocument()
  })

  it('renders statistics', () => {
    render(<TrustSignals />)

    expect(screen.getByText('10,000+')).toBeInTheDocument()
    expect(screen.getByText('98%')).toBeInTheDocument()
    expect(screen.getByText('4.9/5')).toBeInTheDocument()
    expect(screen.getByText('24hr')).toBeInTheDocument()

    expect(screen.getByText('Audits Delivered')).toBeInTheDocument()
    expect(screen.getByText('Satisfaction Rate')).toBeInTheDocument()
    expect(screen.getByText('Average Rating')).toBeInTheDocument()
    expect(screen.getByText('Report Delivery')).toBeInTheDocument()
  })

  it('renders all testimonials', () => {
    render(<TrustSignals />)

    // Check for testimonial authors
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument()
    expect(screen.getByText('Michael Rodriguez')).toBeInTheDocument()
    expect(screen.getByText('Emily Thompson')).toBeInTheDocument()

    // Check for testimonial content
    expect(
      screen.getByText(/40% increase in organic traffic/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/improve our conversion rate by 25%/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/security vulnerabilities they found/)
    ).toBeInTheDocument()
  })

  it('renders 5-star ratings for all testimonials', () => {
    const { container } = render(<TrustSignals />)

    // Each testimonial has 5 stars, so we should have star icons with fill-yellow-400 class
    const stars = container.querySelectorAll('svg.fill-yellow-400')

    // We have 3 testimonials with 5 stars each = 15 stars
    expect(stars.length).toBe(15)
  })

  it('renders security badges', () => {
    render(<TrustSignals />)

    expect(screen.getByText('Powered by Stripe')).toBeInTheDocument()
    expect(screen.getByText('256-bit SSL Encryption')).toBeInTheDocument()
    expect(screen.getByText('30-Day Money Back Guarantee')).toBeInTheDocument()
  })

  it('renders section heading', () => {
    render(<TrustSignals />)

    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Trusted by Leading Businesses')
  })

  it('renders payment security message', () => {
    render(<TrustSignals />)

    expect(
      screen.getByText('Your payment is secure and protected')
    ).toBeInTheDocument()
  })

  it('has proper grid layout classes', () => {
    const { container } = render(<TrustSignals />)

    // Stats grid
    const statsGrid = container.querySelector(
      '.grid.grid-cols-2.md\\:grid-cols-4'
    )
    expect(statsGrid).toBeInTheDocument()

    // Testimonials grid
    const testimonialGrid = container.querySelector('.grid.md\\:grid-cols-3')
    expect(testimonialGrid).toBeInTheDocument()
  })
})
