// Main exports for abandoned cart recovery system

export * from './tracker'
export * from './service'
export * from './analytics'

// Re-export key classes and functions for convenience
export { AbandonedCartService } from './service'
export type { AbandonedCartServiceConfig } from './service'

export {
  trackCheckoutSession,
  markSessionCompleted,
  isSessionRecoverable,
  getAbandonedCartByToken,
  markCartRecovered,
} from './tracker'

export {
  getAbandonmentMetrics,
  getAbandonmentBreakdown,
  getTopAbandonedBusinesses,
} from './analytics'

export type {
  AbandonmentMetrics,
  AbandonmentBreakdown,
} from './analytics'