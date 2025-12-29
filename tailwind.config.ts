import type { Config } from 'tailwindcss'

/**
 * ANTHRASITE TAILWIND CONFIG - SIMPLIFIED
 *
 * Core colors are defined in globals.css as CSS variables.
 * Use them directly: bg-[var(--bg)], text-[var(--primary)]
 * Or use hex values: bg-[#232323], text-[#0066FF]
 *
 * Color Reference:
 * - Background: #232323 (--bg)
 * - Surface: #141414 (--surface)
 * - Primary/CTA: #0066FF (--primary)
 * - Primary hover: #0052CC (--primary-hover)
 * - Success: #22C55E (--success)
 * - Warning: #F59E0B (--warning)
 * - Error: #DC2626 (--error)
 * - Border: rgba(255,255,255,0.1) (--border)
 */

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
