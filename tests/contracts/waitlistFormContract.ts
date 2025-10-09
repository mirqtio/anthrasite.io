export const WaitlistFormIds = {
  form: 'waitlist-form',
  emailInput: 'waitlist-email',
  domainInput: 'waitlist-domain',
  submitButton: 'waitlist-submit',
  successBanner: 'waitlist-success',
  errorBanner: 'waitlist-error',
  openButton: 'open-waitlist-button', // if it opens a modal
} as const

export const WaitlistA11y = {
  formRole: 'form',
  emailLabel: /email/i,
  domainLabel: /domain/i,
  submitName: /join waitlist|submit/i,
  successText: /you are on the waitlist/i,
  errorText: /invalid|already|error/i,
} as const
