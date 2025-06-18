import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children content', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    )
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('renders with custom className', () => {
    render(
      <Card className="custom-class">
        <p>Content</p>
      </Card>
    )
    const card = screen.getByText('Content').parentElement
    expect(card).toHaveClass('custom-class')
  })

  it('renders with hover effect', () => {
    render(
      <Card hover>
        <p>Hoverable card</p>
      </Card>
    )
    const card = screen.getByText('Hoverable card').parentElement
    expect(card).toHaveClass('hover:shadow-lg')
  })

  it('renders with padding variants', () => {
    const { rerender } = render(
      <Card padding="sm">
        <p>Small padding</p>
      </Card>
    )
    let card = screen.getByText('Small padding').parentElement
    expect(card).toHaveClass('p-4')

    rerender(
      <Card padding="md">
        <p>Medium padding</p>
      </Card>
    )
    card = screen.getByText('Medium padding').parentElement
    expect(card).toHaveClass('p-6')

    rerender(
      <Card padding="lg">
        <p>Large padding</p>
      </Card>
    )
    card = screen.getByText('Large padding').parentElement
    expect(card).toHaveClass('p-8')
  })

  it('can be rendered as different elements', () => {
    const { rerender } = render(
      <Card as="section">
        <p>Section card</p>
      </Card>
    )
    expect(screen.getByText('Section card').parentElement?.tagName).toBe('SECTION')

    rerender(
      <Card as="article">
        <p>Article card</p>
      </Card>
    )
    expect(screen.getByText('Article card').parentElement?.tagName).toBe('ARTICLE')
  })
})