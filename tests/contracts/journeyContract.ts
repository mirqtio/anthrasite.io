/**
 * Journey Contract - Test IDs for E2E journey tests
 * Provides stable, non-visual hooks for journey assertions
 *
 * Note: These align with WaitlistFormIds from waitlistFormContract.ts
 */
export const JourneyIds = {
  // Waitlist journey (aligned with WaitlistFormIds)
  openWaitlist: 'open-waitlist-button',
  waitlistForm: 'waitlist-form',
  waitlistEmail: 'waitlist-email',
  waitlistDomain: 'waitlist-domain',
  waitlistSubmit: 'waitlist-submit',
  waitlistSuccess: 'waitlist-success',
  waitlistError: 'waitlist-error',

  // Purchase journey
  navPurchase: 'nav-purchase',
  purchaseCTA: 'purchase-cta',
  purchaseButton: 'purchase-button',

  // Generic success/error states
  successBanner: 'journey-success',
  errorBanner: 'journey-error',
} as const

/**
 * A11y-based selectors for journeys (role/label based)
 */
export const JourneyA11y = {
  emailLabel: /email/i,
  domainLabel: /domain/i,
  submitButton: /join waitlist|submit|get (your )?report/i,
  successMessage: /you('re| are) on the (waitlist|list)|thank you|success/i,
} as const
