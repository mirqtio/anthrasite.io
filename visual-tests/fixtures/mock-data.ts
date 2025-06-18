/**
 * Mock data for visual regression tests
 * Ensures consistent data across test runs
 */

export const mockDates = {
  current: '2025-01-01T12:00:00Z',
  past: '2024-12-01T10:00:00Z',
  future: '2025-02-01T14:00:00Z',
}

export const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
  company: 'Test Company Inc.',
}

export const mockUTMParams = {
  valid: {
    utm_source: 'test',
    utm_medium: 'visual',
    utm_campaign: 'regression',
    utm_content: 'screenshot',
    token: 'valid-test-token-123',
  },
  expired: {
    utm_source: 'test',
    utm_medium: 'visual',
    utm_campaign: 'expired',
    token: 'expired-test-token-456',
  },
  used: {
    utm_source: 'test',
    utm_medium: 'visual',
    utm_campaign: 'used',
    token: 'used-test-token-789',
  },
}

export const mockWaitlistData = {
  email: 'waitlist@example.com',
  company: 'Waitlist Company',
  role: 'Marketing Manager',
  useCase: 'Testing visual regression for waitlist form',
}

export const mockReportData = {
  metrics: {
    totalSessions: '45,678',
    conversionRate: '3.2%',
    averageOrderValue: '$127.50',
    bounceRate: '42.1%',
  },
  channels: [
    { name: 'Organic Search', value: 35 },
    { name: 'Direct', value: 25 },
    { name: 'Social Media', value: 20 },
    { name: 'Email', value: 15 },
    { name: 'Referral', value: 5 },
  ],
  trends: [
    { date: '2024-12-01', value: 100 },
    { date: '2024-12-08', value: 120 },
    { date: '2024-12-15', value: 115 },
    { date: '2024-12-22', value: 130 },
    { date: '2024-12-29', value: 125 },
  ],
}

export const mockFAQData = [
  {
    question: 'What is included in the Website Analytics Report?',
    answer: 'Our comprehensive report includes traffic analysis, conversion metrics, user behavior insights, and actionable recommendations.',
  },
  {
    question: 'How long does it take to receive my report?',
    answer: 'Reports are typically delivered within 24-48 hours after purchase.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee if you\'re not satisfied with your report.',
  },
]

export const mockTestimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Marketing Director',
    company: 'TechCorp',
    content: 'The insights from Anthrasite helped us increase our conversion rate by 45% in just 3 months.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'CEO',
    company: 'StartupXYZ',
    content: 'Best investment we made this year. The report identified critical issues we had overlooked.',
    rating: 5,
  },
]

export const mockConsentData = {
  analytics: true,
  marketing: false,
  functional: true,
}

export const mockHelpWidgetState = {
  isOpen: false,
  selectedCategory: null,
  searchQuery: '',
}