// Referral Program - Main exports

// Server-side validation
export {
  validateReferralCode,
  validateForCheckout,
  getReferralCodeByStripePromoId,
  getConfig,
  isFriendsAndFamilyEnabled,
  formatDiscount,
  calculateDiscountedPrice,
  type ReferralCode,
  type ValidationResult,
} from './validation'

// Payout logic
export {
  calculateReward,
  executePayout,
  updateCodeTracking,
  recordConversion,
  incrementRedemptionCount,
  type PayoutCalculation,
  type PayoutResult,
} from './payout'

// Client-side storage (re-export for convenience, but should be imported directly)
// Note: These are 'use client' exports
