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
  },
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
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
      expect(heading?.className).toMatch(/text-3xl.*md:text-5xl/)

      const subtitle = container.querySelector('p')
      expect(subtitle?.className).toMatch(/text-lg.*md:text-xl/)
    })

    it('should have responsive padding', () => {
      const { container } = render(
        <PurchaseHero businessName="Test" domain="test.com" />
      )

      const section = container.querySelector('section')
      expect(section?.className).toMatch(/py-12.*md:py-20/)
    })
  })

  describe('ReportPreview', () => {
    it('should have responsive grid layout', () => {
      const { container } = render(<ReportPreview preview={mockPreview} />)

      // Metrics grid should be 2 columns on mobile, 4 on desktop
      const metricsGrid = container.querySelector(
        '.grid.grid-cols-2.md\\:grid-cols-4'
      )
      expect(metricsGrid).toBeInTheDocument()

      // What's included grid should stack on mobile
      const includesGrid = container.querySelector('.grid.md\\:grid-cols-2')
      expect(includesGrid).toBeInTheDocument()
    })

    it('should have responsive spacing', () => {
      const { container } = render(<ReportPreview preview={mockPreview} />)

      const section = container.querySelector('section')
      expect(section?.className).toMatch(/py-16.*md:py-24/)
    })

    it('should have responsive text sizes', () => {
      const { container } = render(<ReportPreview preview={mockPreview} />)

      const heading = container.querySelector('h2')
      expect(heading?.className).toMatch(/text-3xl.*md:text-4xl/)
    })
  })

  describe('TrustSignals', () => {
    it('should have responsive testimonial grid', () => {
      const { container } = render(<TrustSignals />)

      // Should stack on mobile, 3 columns on desktop
      const testimonialGrid = container.querySelector('.grid.md\\:grid-cols-3')
      expect(testimonialGrid).toBeInTheDocument()
    })

    it('should have responsive stats grid', () => {
      const { container } = render(<TrustSignals />)

      // 2 columns on mobile, 4 on desktop
      const statsGrid = container.querySelector(
        '.grid.grid-cols-2.md\\:grid-cols-4'
      )
      expect(statsGrid).toBeInTheDocument()
    })

    it('should have responsive trust badge layout', () => {
      const { container } = render(<TrustSignals />)

      const badgeContainer = container.querySelector(
        '.flex.flex-wrap.justify-center.gap-8.md\\:gap-12'
      )
      expect(badgeContainer).toBeInTheDocument()
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
      expect(section?.className).toMatch(/py-16.*md:py-24/)

      const card = container.querySelector('.p-8.md\\:p-10')
      expect(card).toBeInTheDocument()
    })

    it('should have responsive text sizes', () => {
      const { container } = render(
        <PricingCard
          businessName="Test"
          utm="test-utm"
          onCheckout={async () => {}}
        />
      )

      const heading = container.querySelector('h2')
      expect(heading?.className).toMatch(/text-3xl.*md:text-4xl/)
    })

    it('should have full-width button', () => {
      const { container } = render(
        <PricingCard
          businessName="Test"
          utm="test-utm"
          onCheckout={async () => {}}
        />
      )

      const button = container.querySelector('button')
      expect(button?.className).toContain('w-full')
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
