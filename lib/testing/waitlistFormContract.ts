/**
 * Waitlist Form Selector Contract
 *
 * This is the single source of truth for all waitlist form selectors.
 * Both the application components AND E2E tests import from this file,
 * preventing component drift.
 */

export const WaitlistFormIds = {
  openButton: 'waitlist-open',
  form: 'waitlist-form',
  emailInput: 'waitlist-email',
  domainInput: 'waitlist-domain',
  submitButton: 'waitlist-submit',
  successBanner: 'waitlist-success',
  errorBanner: 'waitlist-error',
} as const

export const WaitlistA11y = {
  formRole: 'form',
  emailLabel: /email/i,
  domainLabel: /domain|website/i,
  submitName: /join waitlist|submit/i,
  successText: /you're on the list|on the waitlist/i,
  errorText: /invalid|already|error|wrong/i,
} as const
