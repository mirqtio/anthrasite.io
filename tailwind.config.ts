import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'anthracite': {
          'black': '#0A0A0A',
          'white': '#FFFFFF',
          'blue': '#0066FF',
          'gray': {
            '50': '#FAFAFA',
            '100': '#F5F5F5',
            '200': '#E5E5E5',
          },
          'error': '#FF3B30',
        }
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'Helvetica Now', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'hero': ['64px', { lineHeight: '1.1', fontWeight: '300' }],
        'hero-mobile': ['40px', { lineHeight: '1.1', fontWeight: '300' }],
        'subheadline': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'business-name': ['32px', { lineHeight: '1.2', fontWeight: '500' }],
        'label': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'value-prop': ['48px', { lineHeight: '1.1', fontWeight: '300' }],
        'button': ['18px', { lineHeight: '1', fontWeight: '500' }],
      },
      spacing: {
        '18': '4.5rem',
        '56': '14rem',
      },
      height: {
        'button': '56px',
      },
      width: {
        'button-desktop': '400px',
        'help-button': '56px',
        'help-panel': '400px',
        'help-panel-mobile': '340px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-delay-1': 'fadeIn 0.8s ease-out 200ms both',
        'fade-in-delay-2': 'fadeIn 0.8s ease-out 400ms both',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'check-draw': 'checkDraw 0.6s ease-out',
        'hover-scale': 'hoverScale 0.2s ease-out',
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
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      borderRadius: {
        'button': '0px',
        'card': '20px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'button': '0 4px 16px rgba(0, 102, 255, 0.2)',
        'help': '0 4px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config