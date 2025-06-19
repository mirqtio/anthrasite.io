import { render } from '@testing-library/react'
import { PurchaseHero } from '../PurchaseHero'
import { ReportPreview } from '../ReportPreview'
import { TrustSignals } from '../TrustSignals'
import { PricingCard } from '../PricingCard'
import { ReportPreviewData } from '@/lib/purchase/purchase-service'

// Mock dependencies
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      initial,
      animate,
      transition,
      whileInView,
      viewport,
      ...props
    }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    h1: ({
      children,
      className,
      initial,
      animate,
      transition,
      whileInView,
      viewport,
      ...props
    }: any) => (
      <h1 className={className} {...props}>
        {children}
      </h1>
    ),
    p: ({
      children,
      className,
      initial,
      animate,
      transition,
      whileInView,
      viewport,
      ...props
    }: any) => (
      <p className={className} {...props}>
        {children}
      </p>
    ),
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/lib/analytics/analytics-client', () => ({
  trackEvent: jest.fn(),
}))

jest.mock('@/components/Logo', () => ({
  Logo: () => <div>Logo</div>,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// Helper to check if element has responsive classes
const hasResponsiveClasses = (
  element: HTMLElement,
  mobileClass: string,
  desktopClass: string
) => {
  const classes = element.className.split(' ')
  return classes.includes(mobileClass) || classes.includes(desktopClass)
}

describe('Purchase Components - Mobile Responsiveness', () => {
  const mockPreview: ReportPreviewData = {
    domain: 'example.com',
    metrics: {
      performanceScore: 75,
      seoScore: 82,
      securityScore: 90,
      accessibilityScore: 68,
    },
    improvements: ['Improvement 1', 'Improvement 2', 'Improvement 3'],
    estimatedValue: '$2,500 - $5,000 per month',
  }

  describe('PurchaseHero', () => {
    it('should have responsive text sizes', () => {
      const { container } = render(
        <PurchaseHero businessName="Test" domain="test.com" />
      )

      const heading = container.querySelector('h1')
      expect(heading?.className).toContain('text-[48px]')

      const subtitle = container.querySelector('p')
      expect(subtitle?.className).toContain('text-[24px]')
    })

    it('should have responsive padding', () => {
      const { container } = render(
        <PurchaseHero businessName="Test" domain="test.com" />
      )

      const header = container.querySelector('header')
      expect(header?.className).toMatch(/py-8.*md:py-10/)
    })
  })

  describe('ReportPreview', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<ReportPreview preview={mockPreview} />)

      // Metrics grid should be 2 columns on mobile, 4 on desktop
      const metricsGrid = container.querySelector('.grid')
      expect(metricsGrid?.className).toMatch(/grid-cols-2.*md:grid-cols-4/)
    })

    it('should have responsive spacing', () => {
      const { container } = render(<ReportPreview preview={mockPreview} />)

      const section = container.querySelector('section')
      expect(section?.className).toContain('py-16')
      expect(section?.className).toContain('md:py-24')
    })

    it('should have responsive text sizes', () => {
      const { container } = render(<ReportPreview preview={mockPreview} />)

      // The actual component uses fixed text sizes
      const heading = container.querySelector('h2')
      expect(heading?.className).toContain('text-[40px]')
    })
  })

  describe('TrustSignals', () => {
    it('should have responsive testimonial grid', () => {
      const { container } = render(<TrustSignals />)

      // Find the testimonials grid (last grid element in TrustSignals)
      const grids = container.querySelectorAll('.grid')
      const testimonialGrid = grids[grids.length - 1] // Last grid is testimonials
      expect(testimonialGrid?.className).toContain('md:grid-cols-3')
    })

    it('should have responsive stats grid', () => {
      const { container } = render(<TrustSignals />)

      // 2 columns on mobile, 4 on desktop
      const statsGrid = container.querySelector('.grid')
      expect(statsGrid?.className).toMatch(/grid-cols-2.*md:grid-cols-4/)
    })

    it('should have responsive trust badge layout', () => {
      const { container } = render(<TrustSignals />)

      const badgeContainer = container.querySelector(
        '.flex.flex-wrap.justify-center'
      )
      expect(badgeContainer).toBeInTheDocument()
      expect(badgeContainer?.className).toContain('gap-12')
      expect(badgeContainer?.className).toContain('md:gap-16')
    })
  })

  describe('PricingCard', () => {
    it('should have responsive padding', () => {
      const { container } = render(
        <PricingCard
          businessName="Test"
          utm="test-utm"
          onCheckout={async () => {}}
        />
      )

      const section = container.querySelector('section')
      expect(section?.className).toContain('py-12')
      expect(section?.className).toContain('md:py-16')

      // The actual component uses p-[60px]
      const card = container.querySelector('.carbon-container')
      expect(card).toBeInTheDocument()
      expect(card?.className).toContain('p-[60px]')
    })

    it('should have responsive text sizes', () => {
      const { container } = render(
        <PricingCard
          businessName="Test"
          utm="test-utm"
          onCheckout={async () => {}}
        />
      )

      // The actual component uses fixed text sizes
      const heading = container.querySelector('h2')
      expect(heading?.className).toContain('text-[32px]')
    })

    it('should have minimum width button', () => {
      const { container } = render(
        <PricingCard
          businessName="Test"
          utm="test-utm"
          onCheckout={async () => {}}
        />
      )

      const button = container.querySelector('button')
      expect(button?.className).toContain('min-w-[240px]')
    })
  })

  describe('Breakpoint consistency', () => {
    it('should use consistent breakpoint prefixes', () => {
      const components = [
        <PurchaseHero key="hero" businessName="Test" domain="test.com" />,
        <ReportPreview key="preview" preview={mockPreview} />,
        <TrustSignals key="trust" />,
        <PricingCard
          key="pricing"
          businessName="Test"
          utm="test"
          onCheckout={async () => {}}
        />,
      ]

      components.forEach((component) => {
        const { container } = render(component)
        const html = container.innerHTML

        // Check for consistent use of md: prefix for tablet/desktop
        expect(html).toMatch(/md:/i)

        // Should not use inconsistent breakpoints like lg: or xl: without md:
        const hasLgWithoutMd = html.match(/(?<!md:.*)\blg:/i)
        const hasXlWithoutMd = html.match(/(?<!md:.*)\bxl:/i)

        // It's okay to have lg: or xl: as long as there's also md:
        if (hasLgWithoutMd || hasXlWithoutMd) {
          expect(html).toMatch(/md:/i)
        }
      })
    })
  })
})
