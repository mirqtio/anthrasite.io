import Stripe from 'stripe'
import {
  handleStripeError,
  getStripeErrorMessage,
  formatPrice,
  isCheckoutSession,
  isPaymentIntent,
  extractBusinessId,
  extractUtmToken,
  retryStripeOperation,
} from '../utils'

// Mock Stripe error constructors
class MockStripeCardError extends Error {
  code?: string

  constructor(options: { message: string; code?: string }) {
    super(options.message)
    this.code = options.code
    Object.setPrototypeOf(this, Stripe.errors.StripeCardError.prototype)
  }
}

class MockStripeAPIError extends Error {
  constructor(options: { message: string }) {
    super(options.message)
    Object.setPrototypeOf(this, Stripe.errors.StripeAPIError.prototype)
  }
}

class MockStripeInvalidRequestError extends Error {
  constructor(options: { message: string }) {
    super(options.message)
    Object.setPrototypeOf(
      this,
      Stripe.errors.StripeInvalidRequestError.prototype
    )
  }
}

// Legacy mock for backward compatibility
class MockStripeError extends Error {
  type: string
  code?: string

  constructor(options: { message: string; type: string; code?: string }) {
    super(options.message)
    this.type = options.type
    this.code = options.code
    Object.setPrototypeOf(this, MockStripeError.prototype)
  }
}
// Make MockStripeError look like Stripe.errors.StripeError
Object.setPrototypeOf(
  MockStripeError.prototype,
  Stripe.errors.StripeError.prototype
)

describe('Stripe Utils', () => {
  describe('handleStripeError', () => {
    it('should handle StripeError correctly', () => {
      const error = new MockStripeError({
        message: 'Card declined',
        type: 'card_error',
        code: 'card_declined',
      })

      const result = handleStripeError(error)

      expect(result).toEqual({
        message: 'Card declined',
        code: 'card_declined',
        type: 'card_error',
      })
    })

    it('should handle regular Error', () => {
      const error = new Error('Something went wrong')
      const result = handleStripeError(error)

      expect(result).toEqual({
        message: 'Something went wrong',
      })
    })

    it('should handle unknown errors', () => {
      const result = handleStripeError('Unknown error')

      expect(result).toEqual({
        message: 'An unexpected error occurred',
      })
    })
  })

  describe('getStripeErrorMessage', () => {
    it('should return user-friendly message for card_declined', () => {
      const error = new MockStripeCardError({
        message: 'Card declined',
        code: 'card_declined',
      })

      const message = getStripeErrorMessage(error)
      expect(message).toBe(
        'Your card was declined. Please try a different payment method.'
      )
    })

    it('should return user-friendly message for insufficient_funds', () => {
      const error = new MockStripeCardError({
        message: 'Insufficient funds',
        code: 'insufficient_funds',
      })

      const message = getStripeErrorMessage(error)
      expect(message).toBe(
        'Your card has insufficient funds. Please try a different payment method.'
      )
    })

    it('should return generic message for api_error', () => {
      const error = new MockStripeAPIError({
        message: 'API error',
      })

      const message = getStripeErrorMessage(error)
      expect(message).toBe(
        "We're experiencing technical difficulties. Please try again later."
      )
    })
  })

  describe('formatPrice', () => {
    it('should format USD price correctly', () => {
      expect(formatPrice(9900, 'usd')).toBe('$99.00')
      expect(formatPrice(1000, 'usd')).toBe('$10.00')
      expect(formatPrice(50, 'usd')).toBe('$0.50')
    })

    it('should use USD by default', () => {
      expect(formatPrice(9900)).toBe('$99.00')
    })
  })

  describe('Type Guards', () => {
    it('should identify checkout session', () => {
      expect(isCheckoutSession({ object: 'checkout.session' })).toBe(true)
      expect(isCheckoutSession({ object: 'payment_intent' })).toBe(false)
    })

    it('should identify payment intent', () => {
      expect(isPaymentIntent({ object: 'payment_intent' })).toBe(true)
      expect(isPaymentIntent({ object: 'checkout.session' })).toBe(false)
    })
  })

  describe('Metadata Extractors', () => {
    it('should extract businessId from metadata', () => {
      expect(extractBusinessId({ businessId: 'business-123' })).toBe(
        'business-123'
      )
      expect(extractBusinessId({})).toBeNull()
      expect(extractBusinessId(null)).toBeNull()
      expect(extractBusinessId(undefined)).toBeNull()
    })

    it('should extract utmToken from metadata', () => {
      expect(extractUtmToken({ utmToken: 'utm-123' })).toBe('utm-123')
      expect(extractUtmToken({})).toBeNull()
      expect(extractUtmToken(null)).toBeNull()
      expect(extractUtmToken(undefined)).toBeNull()
    })
  })

  describe('retryStripeOperation', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success')

      const result = await retryStripeOperation(operation)

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and eventually succeed', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Another failure'))
        .mockResolvedValue('success')

      const promise = retryStripeOperation(operation, {
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 1000,
        backoffFactor: 2,
      })

      // Run all timers as the promise progresses
      await jest.runAllTimersAsync()
      const result = await promise

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should not retry card errors', async () => {
      const cardError = new MockStripeError({
        message: 'Card declined',
        type: 'card_error',
        code: 'card_declined',
      })

      const operation = jest.fn().mockRejectedValue(cardError)

      await expect(retryStripeOperation(operation)).rejects.toThrow(cardError)
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should throw after max retries', async () => {
      const error = new Error('Persistent failure')
      const operation = jest.fn().mockRejectedValue(error)

      const promise = retryStripeOperation(operation, {
        maxRetries: 2,
        initialDelay: 100,
        maxDelay: 1000,
        backoffFactor: 2,
      })

      // Advance timers while the promise executes
      const runPromise = promise.catch((e) => e)
      await jest.runAllTimersAsync()
      const result = await runPromise

      expect(result).toBe(error)
      expect(operation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })
  })
})
