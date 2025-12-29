import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ========== ANTHRASITE DESIGN SYSTEM TOKENS ==========
      // Only ADD new tokens - do NOT override Tailwind defaults

      colors: {
        // Legacy anthracite colors (for backwards compatibility)
        anthracite: {
          black: '#0A0A0A',
          white: '#FFFFFF',
          blue: '#0066FF',
          gray: {
            '50': '#FAFAFA',
            '100': '#F5F5F5',
            '200': '#E5E5E5',
          },
          error: '#FF3B30',
        },

        // Background - semantic tokens
        'bg-canvas': 'var(--color-bg-canvas)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-elevated': 'var(--color-bg-surface-elevated)',
        'bg-subtle': 'var(--color-bg-subtle)',

        // Text - semantic tokens
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-muted': 'var(--color-text-muted)',

        // Border - semantic tokens
        'border-default': 'var(--color-border-default)',
        'border-strong': 'var(--color-border-strong)',

        // Interactive - CTA
        'interactive-cta': {
          DEFAULT: 'var(--color-interactive-cta-default)',
          hover: 'var(--color-interactive-cta-hover)',
          active: 'var(--color-interactive-cta-active)',
          disabled: 'var(--color-interactive-cta-disabled)',
          text: 'var(--color-interactive-cta-text)',
        },

        // Status colors
        'status-success': {
          DEFAULT: 'var(--color-status-success)',
          text: 'var(--color-status-success)',
          bg: 'var(--color-status-success-subtle)',
        },
        'status-warning': {
          DEFAULT: 'var(--color-status-warning)',
          text: 'var(--color-status-warning)',
          bg: 'var(--color-status-warning-subtle)',
        },
        'status-error': {
          DEFAULT: 'var(--color-status-error)',
          text: 'var(--color-status-error)',
          bg: 'var(--color-status-error-subtle)',
        },

        // Focus
        'focus-ring': 'var(--color-focus-ring)',
        'focus-ring-offset': 'var(--color-focus-ring-offset)',
      },

      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Helvetica Now',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },

      // Only ADD new spacing tokens - don't override numeric defaults
      spacing: {
        '18': '4.5rem',
        '56': '14rem',
        // Section spacing
        'section-xs': 'var(--spacing-section-xs)',
        'section-sm': 'var(--spacing-section-sm)',
        'section-md': 'var(--spacing-section-md)',
        'section-lg': 'var(--spacing-section-lg)',
        // Component spacing
        'component-xs': 'var(--spacing-component-xs)',
        'component-sm': 'var(--spacing-component-sm)',
        'component-md': 'var(--spacing-component-md)',
        'component-lg': 'var(--spacing-component-lg)',
        'component-xl': 'var(--spacing-component-xl)',
        // Gap spacing
        'gap-xs': 'var(--spacing-gap-xs)',
        'gap-sm': 'var(--spacing-gap-sm)',
        'gap-md': 'var(--spacing-gap-md)',
        'gap-lg': 'var(--spacing-gap-lg)',
      },

      height: {
        button: '56px',
      },

      width: {
        'button-desktop': '400px',
        'help-button': '56px',
        'help-panel': '400px',
        'help-panel-mobile': '340px',
      },

      // Only ADD new border radius tokens
      borderRadius: {
        button: '0px',
        card: '20px',
      },

      // Only ADD new shadows
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.04)',
        button: '0 4px 16px rgba(0, 102, 255, 0.2)',
        help: '0 4px 24px rgba(0, 0, 0, 0.12)',
        cta: 'var(--shadow-cta)',
        'cta-hover': 'var(--shadow-cta-hover)',
      },

      // Only ADD new durations
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
      },

      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-delay-1': 'fadeIn 0.8s ease-out 200ms both',
        'fade-in-delay-2': 'fadeIn 0.8s ease-out 400ms both',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'check-draw': 'checkDraw 0.6s ease-out',
        'hover-scale': 'hoverScale 0.2s ease-out',
        shimmer: 'shimmer 1.5s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        checkDraw: {
          '0%': { 'stroke-dashoffset': '100' },
          '100%': { 'stroke-dashoffset': '0' },
        },
        hoverScale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
