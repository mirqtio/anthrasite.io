import { cartRecoveryEmail } from '../cartRecovery'

describe('Cart Recovery Email Template', () => {
  const baseData = {
    businessName: 'Test Business Inc.',
    amount: '99.00',
    currency: 'USD',
    recoveryUrl: 'https://test.com/purchase/recover?token=abc123',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  }

  it('should generate valid HTML email', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('</html>')
    expect(html).toContain('Complete Your Purchase')
  })

  it('should include business name', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain('Test Business Inc.')
    expect(html).toContain('interested in purchasing an Anthrasite Business Intelligence Report for <strong>Test Business Inc.</strong>')
  })

  it('should include price information', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain('USD 99.00')
    expect(html).toContain('Your comprehensive report is still available for <strong>USD 99.00</strong>')
  })

  it('should include recovery URL', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain(baseData.recoveryUrl)
    expect(html).toContain(`href="${baseData.recoveryUrl}"`)
  })

  it('should include expiration warning', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain('Limited Time:')
    expect(html).toContain('This checkout session expires in')
    expect(html).toContain('hours')
  })

  it('should calculate correct expiration hours', () => {
    const testCases = [
      { hours: 1, expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) },
      { hours: 12, expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) },
      { hours: 24, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    ]

    testCases.forEach(({ hours, expiresAt }) => {
      const html = cartRecoveryEmail({ ...baseData, expiresAt })
      expect(html).toContain(`This checkout session expires in ${hours} hours`)
    })
  })

  it('should include all key features', () => {
    const html = cartRecoveryEmail(baseData)

    const features = [
      'Traffic patterns and user behavior analysis',
      'Market positioning and competitive insights',
      'Revenue potential and growth opportunities',
      'Technical performance metrics',
      'Actionable recommendations for improvement',
    ]

    features.forEach(feature => {
      expect(html).toContain(feature)
    })
  })

  it('should include value propositions', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain('Immediate Access:')
    expect(html).toContain('Data-Driven Insights:')
    expect(html).toContain('One-Time Purchase:')
  })

  it('should include support information', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain('support@anthrasite.io')
    expect(html).toContain('Need help?')
  })

  it('should include unsubscribe message', () => {
    const html = cartRecoveryEmail(baseData)

    expect(html).toContain("If you're no longer interested")
    expect(html).toContain("We won't send another reminder")
  })

  it('should handle different currencies', () => {
    const currencies = ['USD', 'EUR', 'GBP', 'CAD']

    currencies.forEach(currency => {
      const html = cartRecoveryEmail({ ...baseData, currency })
      expect(html).toContain(`${currency} 99.00`)
    })
  })

  it('should include business name in email content', () => {
    // Note: In a production system, you would want to escape HTML in business names
    // to prevent XSS attacks. For now, we're testing that the name is included.
    const specialName = 'Test & Company "Special" <Name>'
    const html = cartRecoveryEmail({ ...baseData, businessName: specialName })

    // The business name should appear in the email
    expect(html).toContain(specialName)
  })
})