'use client'

import { FAQSection } from '@/components/landing/FAQSection'
import type { ConfirmationFAQItem } from '@/lib/confirmation/types'

/**
 * FAQ items specific to the confirmation page.
 * Addresses common post-purchase questions.
 */
const CONFIRMATION_FAQ_ITEMS: ConfirmationFAQItem[] = [
  {
    question: 'How long does it take?',
    answer:
      "Most reports are ready in 2-5 minutes. If it takes longer, we'll email you as soon as it's complete. You don't need to stay on this page.",
  },
  {
    question: 'Where will I get the report?',
    answer:
      "By email. We'll send you a secure link to download your PDF report. There's no account or portal to log into.",
  },
  {
    question: "What if I don't see the email?",
    answer:
      "Check your spam or promotions folder. If it's not there after 10 minutes, reply to your receipt email and we'll help.",
  },
  {
    question: "What if I'm not satisfied?",
    answer:
      "We offer a money-back guarantee. Simply reply to your receipt email and we'll take care of it.",
  },
]

/**
 * Confirmation page FAQ section.
 * Uses the shared FAQSection component with confirmation-specific questions.
 */
export function ConfirmationFAQ() {
  return <FAQSection items={CONFIRMATION_FAQ_ITEMS} />
}
