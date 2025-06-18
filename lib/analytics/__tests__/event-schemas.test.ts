import { validateEventSchema, ANALYTICS_EVENTS } from '../event-schemas'

describe('Event Schemas', () => {
  describe('ANALYTICS_EVENTS', () => {
    it('should export all event constants', () => {
      expect(ANALYTICS_EVENTS.PAGE_VIEW).toBe('page_view')
      expect(ANALYTICS_EVENTS.WAITLIST_SIGNUP).toBe('waitlist_signup')
      expect(ANALYTICS_EVENTS.PURCHASE).toBe('purchase')
      expect(ANALYTICS_EVENTS.PAYMENT_COMPLETED).toBe('payment_completed')
      expect(ANALYTICS_EVENTS.CHECKOUT_ERROR).toBe('checkout_error')
      expect(ANALYTICS_EVENTS.UTM_VALIDATED).toBe('utm_validated')
      expect(ANALYTICS_EVENTS.CHECKOUT_ABANDONED).toBe('checkout_abandoned')
      expect(ANALYTICS_EVENTS.HELP_WIDGET_OPENED).toBe('help_widget_opened')
      expect(ANALYTICS_EVENTS.HELP_WIDGET_FAQ_EXPANDED).toBe(
        'help_widget_faq_expanded'
      )
      expect(ANALYTICS_EVENTS.EXPERIMENT_EVENT).toBe('experiment_event')
      expect(ANALYTICS_EVENTS.VARIANT_IMPRESSION).toBe('variant_impression')
      expect(ANALYTICS_EVENTS.ERROR_BOUNDARY_TRIGGERED).toBe(
        'error_boundary_triggered'
      )
      expect(ANALYTICS_EVENTS.WEB_VITALS).toBe('web_vitals')
      expect(ANALYTICS_EVENTS.CONSENT_UPDATED).toBe('consent_updated')
      expect(ANALYTICS_EVENTS.CHECKOUT_RECOVERY_ATTEMPT).toBe(
        'checkout_recovery_attempt'
      )
      expect(ANALYTICS_EVENTS.CHECKOUT_RECOVERY_SUCCESS).toBe(
        'checkout_recovery_success'
      )
    })
  })

  describe('validateEventSchema', () => {
    it('should validate page_view event', () => {
      expect(
        validateEventSchema('page_view', {
          page_path: '/test',
          page_title: 'Test Page',
        })
      ).toBe(true)
    })

    it('should validate waitlist_signup event', () => {
      expect(
        validateEventSchema('waitlist_signup', {
          domain: 'example.com',
          position: 100,
        })
      ).toBe(true)
    })

    it('should validate purchase events', () => {
      expect(
        validateEventSchema('purchase', {
          transaction_id: 'cs_123',
          value: 99,
          currency: 'USD',
        })
      ).toBe(true)

      expect(
        validateEventSchema('checkout_started', {
          business_name: 'Test Business',
          utm_token: 'token_123',
        })
      ).toBe(true)

      expect(
        validateEventSchema('checkout_error', {
          error: 'Card declined',
          retry_count: 1,
        })
      ).toBe(true)
    })

    it('should validate UTM events', () => {
      expect(
        validateEventSchema('utm_validated', {
          utm_token: 'token_123',
          business_id: 'biz_123',
          valid: true,
        })
      ).toBe(true)
    })

    it('should validate help events', () => {
      expect(
        validateEventSchema('help_widget_opened', {
          context: '/purchase',
        })
      ).toBe(true)

      expect(
        validateEventSchema('help_widget_faq_expanded', {
          question_id: 'faq_1',
          question_text: 'What is included?',
        })
      ).toBe(true)
    })

    it('should validate A/B test events', () => {
      expect(
        validateEventSchema('experiment_event', {
          experiment_id: 'homepage_v2',
          variant_id: 'control',
          event_type: 'impression',
        })
      ).toBe(true)

      expect(
        validateEventSchema('experiment_event', {
          experiment_id: 'homepage_v2',
          variant_id: 'variant_a',
          event_type: 'conversion',
        })
      ).toBe(true)
    })

    it('should validate web vitals event', () => {
      expect(
        validateEventSchema('performance_metric', {
          metric_name: 'LCP',
          metric_value: 2500,
        })
      ).toBe(true)
    })

    it('should validate consent event', () => {
      expect(
        validateEventSchema('consent_updated', {
          analytics: true,
          marketing: false,
          performance: false,
        })
      ).toBe(true)
    })

    it('should allow custom event names (returns true for unknown events)', () => {
      expect(validateEventSchema('custom_event', {})).toBe(true)
    })

    it('should return false for missing required properties', () => {
      expect(
        validateEventSchema('purchase', {
          // Missing transaction_id
          value: 99,
        })
      ).toBe(false)
    })

    it('should return false for invalid property types', () => {
      expect(
        validateEventSchema('purchase', {
          transaction_id: 'cs_123',
          value: 'not a number', // Should be number
          currency: 'USD',
        })
      ).toBe(false)
    })

    it('should allow extra properties', () => {
      expect(
        validateEventSchema('page_view', {
          page_path: '/test',
          page_title: 'Test',
          extra_prop: 'allowed',
        })
      ).toBe(true)
    })

    it('should validate complex nested properties', () => {
      expect(
        validateEventSchema('purchase', {
          transaction_id: 'cs_123',
          value: 99,
          currency: 'USD',
          items: [
            {
              item_id: 'audit_report',
              item_name: 'Website Audit',
              price: 99,
              quantity: 1,
            },
          ],
        })
      ).toBe(true)
    })

    it('should handle undefined properties', () => {
      expect(validateEventSchema('page_view', undefined)).toBe(false)
      expect(validateEventSchema(undefined as any, {})).toBe(true)
    })

    it('should handle null properties', () => {
      expect(validateEventSchema('page_view', null as any)).toBe(false)
    })

    it('should validate error boundary event', () => {
      expect(
        validateEventSchema('error_boundary_triggered', {
          component: 'ErrorBoundary',
          error_message: 'Something went wrong',
        })
      ).toBe(true)
    })
  })
})
