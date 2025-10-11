const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // Standalone output for better artifact portability in CI
  output: 'standalone',
  // Sentry error page optimization
  excludeDefaultMomentLocales: true,
  // Enable source maps for debugging E2E failures in CI
  productionBrowserSourceMaps: true,
  // CSS optimization - removed experimental flag that's causing build issues
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
    // Allow warnings to not fail the lint process
    dirs: ['app', 'components', 'lib', 'middleware.ts'],
  },
  // Webpack optimization
  webpack: (config, { isServer, dev }) => {
    // E2E build: alias PostHog to shim to prevent bundling
    if (process.env.E2E_BUILD === '1') {
      config.resolve.alias = {
        ...config.resolve.alias,
        'posthog-js': path.resolve(__dirname, 'lib/analytics/posthog-shim.ts'),
      }
    }

    if (!isServer) {
      // Skip polyfills for modern browsers
      config.resolve.alias = {
        ...config.resolve.alias,
        // Skip core-js polyfills
        'core-js': false,
      }

      // Disable polyfills that Next.js adds by default
      config.resolve.fallback = {
        ...config.resolve.fallback,
        // Disable Node.js polyfills
        fs: false,
        path: false,
        crypto: false,
      }

      // Target modern browsers only
      if (!dev) {
        config.target = 'web'
        config.output.environment = {
          // Modern JavaScript features that don't need polyfills
          arrowFunction: true,
          const: true,
          destructuring: true,
          forOf: true,
          dynamicImport: true,
          module: true,
        }
      }
    }
    return config
  },
}

// Wrap with Sentry config
module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry webpack plugin options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Upload source maps only in production
    widenClientFileUpload: true,
    transpileClientSDK: true,
    hideSourceMaps: true,
    disableLogger: true,
  }
)
