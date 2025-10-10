/**
 * Feature Flags
 *
 * Centralized feature flag logic for the application.
 * Provides single source of truth for flag checks.
 */

export const isPaymentElementEnabled = () =>
  process.env.NEXT_PUBLIC_FF_PURCHASE_ENABLED === 'true'
