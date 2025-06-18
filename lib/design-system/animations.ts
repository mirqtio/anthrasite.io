import { animation } from './tokens'

export const springPhysics = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
} as const

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: parseFloat(animation.duration.normal) / 1000 },
} as const

export const slideUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: parseFloat(animation.duration.normal) / 1000 },
} as const

export const slideIn = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: parseFloat(animation.duration.normal) / 1000 },
} as const

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: springPhysics,
} as const

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const

// CSS-only animations for performance
export const cssAnimations = {
  fadeIn: `@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }`,
  slideUp: `@keyframes slideUp {
    from { 
      opacity: 0;
      transform: translateY(10px);
    }
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }`,
  pulse: `@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }`,
  spin: `@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }`,
} as const

// Utility function to check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animation hook for respecting motion preferences
export const useAnimation = <T extends Record<string, unknown>>(
  animation: T,
  respectMotionPreference = true
): T | Record<string, never> => {
  if (respectMotionPreference && prefersReducedMotion()) {
    return {} as Record<string, never>
  }
  return animation
}
