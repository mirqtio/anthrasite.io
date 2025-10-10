// Email configuration (SendGrid removed - email functionality disabled)

// Email configuration
export const emailConfig = {
  // From email configuration
  from: {
    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@anthrasite.io',
    name: process.env.SENDGRID_FROM_NAME || 'Anthrasite',
  },

  // Reply-to configuration
  replyTo: {
    email: process.env.SENDGRID_REPLY_TO_EMAIL || 'support@anthrasite.io',
    name: process.env.SENDGRID_REPLY_TO_NAME || 'Anthrasite Support',
  },

  // Email templates configuration
  templates: {
    orderConfirmation: {
      subject: 'Your Anthrasite Report Order Confirmation',
      preheader: 'Thank you for your purchase. Your report is being prepared.',
    },
    reportReady: {
      subject: 'Your Anthrasite Report is Ready!',
      preheader: 'Your business insights report is ready for download.',
    },
    welcomeEmail: {
      subject: 'Welcome to Anthrasite',
      preheader: "Thank you for joining us. Here's what happens next.",
    },
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 60000, // 1 minute
    backoffMultiplier: 2,
  },

  // Feature flags
  features: {
    trackOpens: true,
    trackClicks: true,
    sandboxMode:
      process.env.NODE_ENV === 'development' &&
      process.env.SENDGRID_SANDBOX_MODE !== 'false',
  },
}

// Helper to check if email is configured (always false now)
export const isEmailConfigured = () => {
  return false
}
