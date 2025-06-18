import { z } from 'zod'
import { EventProperties } from './types'

// Define schemas for common events
const eventSchemas = {
  // Page view events
  page_view: z.object({
    page_path: z.string(),
    page_title: z.string().optional(),
    referrer: z.string().optional(),
  }),

  // Funnel events
  funnel_step: z.object({
    funnel_name: z.string(),
    funnel_step: z.number(),
    step_name: z.string(),
  }),

  // E-commerce events
  purchase: z.object({
    transaction_id: z.string(),
    value: z.number(),
    currency: z.string().default('USD'),
  }),

  checkout_started: z.object({
    business_name: z.string(),
    utm_token: z.string(),
  }),

  checkout_error: z.object({
    error: z.string(),
    retry_count: z.number().optional(),
  }),

  checkout_session_created: z.object({
    session_id: z.string(),
    business_id: z.string(),
    amount_cents: z.number(),
  }),

  // Waitlist events
  waitlist_signup: z.object({
    domain: z.string(),
    variant: z.string().optional(),
    domain_tld: z.string().optional(),
  }),

  // A/B testing events
  experiment_event: z.object({
    experiment_id: z.string(),
    variant_id: z.string(),
    event_type: z.string(),
  }),

  // Performance events
  performance_metric: z.object({
    metric_name: z.string(),
    metric_value: z.number(),
  }),

  // Error events
  error_boundary_triggered: z.object({
    component: z.string(),
    error_message: z.string(),
  }),

  // UTM events
  utm_validated: z.object({
    business_id: z.string(),
    utm_token: z.string(),
    valid: z.boolean(),
  }),

  // Email events
  email_sent: z.object({
    email_type: z.string(),
    recipient: z.string().email(),
    success: z.boolean(),
  }),

  // Help widget events
  help_widget_opened: z.object({
    context: z.string(),
  }),

  help_widget_faq_expanded: z.object({
    question_id: z.string(),
    question_text: z.string(),
  }),

  // Recovery events
  checkout_recovery_attempt: z.object({
    business_id: z.string().optional(),
    utm_token: z.string(),
    has_session_id: z.boolean(),
  }),

  checkout_recovery_success: z.object({
    business_id: z.string().optional(),
    session_id: z.string(),
    recovery_type: z.enum(['existing_session', 'new_session']),
  }),

  // Analytics meta events
  analytics_initialized: z.object({
    providers: z.array(z.string()),
  }),

  consent_updated: z.object({
    analytics: z.boolean(),
    marketing: z.boolean(),
    performance: z.boolean(),
  }),
}

// Base properties that all events should have
const baseEventProperties = z.object({
  session_id: z.string().optional(),
  timestamp: z.string().optional(),
  experiment_variants: z.record(z.string()).optional(),
})

export function validateEventSchema(eventName: string, properties?: EventProperties): boolean {
  // If no schema defined for this event, allow it (for custom events)
  const schema = eventSchemas[eventName as keyof typeof eventSchemas]
  if (!schema) {
    return true
  }

  try {
    // Merge with base properties and validate
    const fullSchema = baseEventProperties.merge(schema)
    fullSchema.parse(properties || {})
    return true
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Validation error for event ${eventName}:`, error.errors)
    }
    return false
  }
}

// Export event names as constants to prevent typos
export const ANALYTICS_EVENTS = {
  // Page events
  PAGE_VIEW: 'page_view',
  
  // Funnel events
  FUNNEL_STEP: 'funnel_step',
  HOMEPAGE_VIEW: 'homepage_view',
  UTM_VALIDATED: 'utm_validated',
  CHECKOUT_STARTED: 'checkout_started',
  PAYMENT_COMPLETED: 'payment_completed',
  
  // E-commerce events
  PURCHASE: 'purchase',
  CHECKOUT_ERROR: 'checkout_error',
  CHECKOUT_SESSION_CREATED: 'checkout_session_created',
  CHECKOUT_ABANDONED: 'checkout_abandoned',
  
  // Waitlist events
  WAITLIST_SIGNUP: 'waitlist_signup',
  WAITLIST_DOMAIN_VALIDATED: 'waitlist_domain_validated',
  
  // A/B testing events
  EXPERIMENT_EVENT: 'experiment_event',
  VARIANT_IMPRESSION: 'variant_impression',
  
  // Performance events
  PERFORMANCE_METRIC: 'performance_metric',
  WEB_VITALS: 'web_vitals',
  
  // Error events
  ERROR_BOUNDARY_TRIGGERED: 'error_boundary_triggered',
  STRIPE_ERROR: 'stripe_error',
  
  // Email events
  EMAIL_SENT: 'email_sent',
  EMAIL_BOUNCED: 'email_bounced',
  
  // Help widget events
  HELP_WIDGET_OPENED: 'help_widget_opened',
  HELP_WIDGET_FAQ_EXPANDED: 'help_widget_faq_expanded',
  
  // Recovery events
  CHECKOUT_RECOVERY_ATTEMPT: 'checkout_recovery_attempt',
  CHECKOUT_RECOVERY_SUCCESS: 'checkout_recovery_success',
  CHECKOUT_RECOVERY_FAILED: 'checkout_recovery_failed',
  
  // Analytics meta events
  ANALYTICS_INITIALIZED: 'analytics_initialized',
  CONSENT_UPDATED: 'consent_updated',
} as const