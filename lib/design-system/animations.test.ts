import { prefersReducedMotion, useAnimation, fadeIn } from './animations'

describe('Animation Utilities', () => {
  const mockMatchMedia = (matches: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  }

  describe('prefersReducedMotion', () => {
    it('returns false when matchMedia is not available', () => {
      const originalMatchMedia = window.matchMedia
      // @ts-expect-error - Testing matchMedia undefined
      window.matchMedia = undefined as any
      
      expect(prefersReducedMotion()).toBe(false)
      
      window.matchMedia = originalMatchMedia
    })

    it('returns false when user does not prefer reduced motion', () => {
      mockMatchMedia(false)
      expect(prefersReducedMotion()).toBe(false)
    })

    it('returns true when user prefers reduced motion', () => {
      mockMatchMedia(true)
      expect(prefersReducedMotion()).toBe(true)
    })
  })

  describe('useAnimation', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: false,
          media: query,
        })),
      })
    })

    it('returns animation when motion is not reduced', () => {
      const result = useAnimation(fadeIn)
      expect(result).toEqual(fadeIn)
    })

    it('returns empty object when motion is reduced and respectMotionPreference is true', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: true,
          media: query,
        })),
      })

      const result = useAnimation(fadeIn)
      expect(result).toEqual({})
    })

    it('returns animation when motion is reduced but respectMotionPreference is false', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: true,
          media: query,
        })),
      })

      const result = useAnimation(fadeIn, false)
      expect(result).toEqual(fadeIn)
    })
  })
})