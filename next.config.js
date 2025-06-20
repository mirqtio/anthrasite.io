// Temporarily disable Sentry to get the site running
// const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  // Sentry error page optimization
  excludeDefaultMomentLocales: true,
  productionBrowserSourceMaps: false,
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
}

// Temporarily export without Sentry
module.exports = nextConfig

// Wrap with Sentry config when dependencies are installed
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
