export const colors = {
  anthracite: {
    black: '#0A0A0A',
    white: '#FFFFFF',
    blue: '#0066FF',
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5',
    },
    error: '#FF3B30',
  },
} as const

export const typography = {
  fontFamily: {
    sans: ['Inter', 'Helvetica Neue', 'system-ui', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace'],
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

export const animation = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '600ms',
    slower: '800ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeInOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 2px 8px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
} as const

export const radii = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const

export const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
} as const
