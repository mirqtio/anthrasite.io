const { withSentryConfig } = require('@sentry/nextjs')

console.log('[nextconfig] start')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false, // Temporarily disabled for clearer error messages
  // Sentry error page optimization
  excludeDefaultMomentLocales: true,
  productionBrowserSourceMaps: false,
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
  // Webpack optimization - TEMPORARILY DISABLED FOR BUILD DEBUG
  // webpack: (config, { isServer, dev }) => {
  //   if (!isServer) {
  //     // Skip polyfills for modern browsers
  //     config.resolve.alias = {
  //       ...config.resolve.alias,
  //       // Skip core-js polyfills
  //       'core-js': false,
  //     }
  //
  //     // Disable polyfills that Next.js adds by default
  //     config.resolve.fallback = {
  //       ...config.resolve.fallback,
  //       // Disable Node.js polyfills
  //       fs: false,
  //       path: false,
  //       crypto: false,
  //     }
  //
  //     // Target modern browsers only
  //     if (!dev) {
  //       config.target = 'web'
  //       config.output.environment = {
  //         // Modern JavaScript features that don't need polyfills
  //         arrowFunction: true,
  //         const: true,
  //         destructuring: true,
  //         forOf: true,
  //         dynamicImport: true,
  //         module: true,
  //       }
  //     }
  //   }
  //   return config
  // },
}

// Wrap with Sentry config - TEMPORARILY DISABLED FOR BUILD DEBUG
// module.exports = withSentryConfig(
//   nextConfig,
//   {
//     // Sentry webpack plugin options
//     silent: true,
//     org: process.env.SENTRY_ORG,
//     project: process.env.SENTRY_PROJECT,
//   },
//   {
//     // Upload source maps only in production
//     widenClientFileUpload: true,
//     transpileClientSDK: true,
//     hideSourceMaps: true,
//     disableLogger: true,
//   }
// )

// Temporary: Export plain config without Sentry wrapper
console.log('[nextconfig] exported')
module.exports = nextConfig
