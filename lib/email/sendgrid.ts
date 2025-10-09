/**
 * SendGrid Provider - ARCHIVED
 *
 * This file is a stub to prevent silent failures.
 * SendGrid has been replaced by Gmail SMTP.
 *
 * @see lib/email/gmail.ts for the new email provider
 * @see _archive/lib/email/sendgrid.ts for the original implementation
 * @archived 2025-10-07 (G3)
 */

export interface SendEmailOptions {
  to: string
  templateId: string
  dynamicTemplateData: Record<string, any>
}

/**
 * @deprecated SendGrid is no longer used. Use lib/email/gmail.ts instead.
 * @throws Error always - this provider has been archived
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  throw new Error(
    'ARCHIVED_PROVIDER: SendGrid is disabled. Use Gmail SMTP via lib/email/gmail.ts. ' +
      'See _archive/lib/email/sendgrid.ts for the original implementation.'
  )
}
