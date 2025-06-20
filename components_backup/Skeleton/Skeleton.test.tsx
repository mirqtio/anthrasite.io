import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('has animation class', () => {
    render(<Skeleton data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse')
  })

  it('renders with custom className', () => {
    render(<Skeleton className="custom-class" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('custom-class')
  })

  it('renders with custom width and height', () => {
    render(<Skeleton className="h-20 w-40" data-testid="skeleton" />)
    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveClass('h-20')
    expect(skeleton).toHaveClass('w-40')
  })

  it('renders circular variant', () => {
    render(<Skeleton className="rounded-full" data-testid="skeleton" />)
    expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full')
  })
})
