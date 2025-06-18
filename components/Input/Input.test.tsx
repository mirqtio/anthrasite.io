import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('shows error state', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveClass('border-anthracite-error')
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders different types', () => {
    render(<Input type="email" data-testid="email-input" />)
    expect(screen.getByTestId('email-input')).toHaveAttribute('type', 'email')
  })

  it('renders password type', () => {
    render(<Input type="password" data-testid="password-input" />)
    expect(screen.getByTestId('password-input')).toHaveAttribute(
      'type',
      'password'
    )
  })

  it('renders with icon', () => {
    const Icon = () => <svg data-testid="icon" />
    render(<Input icon={<Icon />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('shows character count', () => {
    render(<Input defaultValue="Hello" showCount maxLength={10} />)
    expect(screen.getByText('5 / 10')).toBeInTheDocument()
  })
})
