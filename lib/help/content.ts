/**
 * FAQ Content for Anthrasite.io
 */

import { FAQItem, FAQCategory } from './types'

/**
 * General FAQs - Always available
 */
export const GENERAL_FAQS: FAQItem[] = [
  {
    id: 'what-is-anthrasite',
    question: 'What is Anthrasite?',
    answer:
      "Anthrasite is a comprehensive website performance analytics tool that provides deep insights into your site's speed, user experience, and technical health. Our AI-powered analysis helps you identify and fix performance issues that impact your users and search rankings.",
    category: FAQCategory.GENERAL,
    tags: ['about', 'overview', 'getting-started'],
  },
  {
    id: 'how-it-works',
    question: 'How does Anthrasite work?',
    answer:
      "Simply enter your website URL, and our AI engine performs a comprehensive analysis of your site's performance, accessibility, SEO, and best practices. You'll receive a detailed report with actionable recommendations within minutes.",
    category: FAQCategory.GENERAL,
    tags: ['process', 'analysis', 'workflow'],
    relatedQuestions: ['what-metrics-analyzed', 'report-delivery-time'],
  },
  {
    id: 'what-metrics-analyzed',
    question: 'What metrics does Anthrasite analyze?',
    answer:
      'We analyze Core Web Vitals (LCP, FID, CLS), page load times, resource optimization, accessibility scores, SEO factors, security headers, mobile responsiveness, and over 100 other performance indicators that affect user experience.',
    category: FAQCategory.GENERAL,
    tags: ['metrics', 'features', 'analysis'],
  },
  {
    id: 'report-delivery-time',
    question: 'How long does it take to get my report?',
    answer:
      "Most reports are generated within 2-5 minutes. Complex sites with many pages may take up to 10 minutes. You'll receive an email notification as soon as your report is ready.",
    category: FAQCategory.GENERAL,
    tags: ['timing', 'report', 'delivery'],
  },
  {
    id: 'supported-websites',
    question: 'What types of websites can be analyzed?',
    answer:
      'Anthrasite can analyze any publicly accessible website, including e-commerce sites, blogs, corporate websites, web applications, and landing pages. We support sites built with any technology stack.',
    category: FAQCategory.GENERAL,
    tags: ['compatibility', 'requirements', 'support'],
  },
]

/**
 * Purchase-specific FAQs
 */
export const PURCHASE_FAQS: FAQItem[] = [
  {
    id: 'what-will-i-get',
    question: 'What exactly will I get in my report?',
    answer:
      'A PDF audit tailored to your site: overall health score, estimated revenue opportunity, side-by-side mock-up, prioritized fix list, and detailed technical findings for performance, SEO, design, and reviews.',
    category: FAQCategory.PURCHASE,
    tags: ['features', 'included', 'report', 'pdf'],
  },
  {
    id: 'dollar-impact',
    question: 'How do you calculate the dollar impact?',
    answer:
      'We blend your traffic estimates with industry-standard conversion data and benchmark uplift from similar fixes. The range is directional—meant to size opportunity, not promise revenue.',
    category: FAQCategory.PURCHASE,
    tags: ['revenue', 'calculation', 'impact', 'methodology'],
  },
  {
    id: 'audit-timeframe',
    question: 'How long does the audit take once I purchase?',
    answer:
      'The report is auto-generated and delivered to your inbox usually within 5 minutes.',
    category: FAQCategory.PURCHASE,
    tags: ['delivery', 'timing', 'fast', 'automated'],
  },
  {
    id: 'technical-skills',
    question: 'Do I need any technical skills to act on the findings?',
    answer:
      'No, though it may help. We make the specific issues as clear as possible, but you may want help from whomever built your site to implement the fixes.',
    category: FAQCategory.PURCHASE,
    tags: ['technical', 'implementation', 'skills', 'requirements'],
  },
  {
    id: 'data-privacy',
    question: 'Is my website data safe and private?',
    answer:
      'Yes. We only analyze publicly available pages and store results on secure, encrypted servers.',
    category: FAQCategory.PURCHASE,
    tags: ['security', 'privacy', 'data', 'safe'],
  },
  {
    id: 'team-sharing',
    question: 'Can I share the report with my team or agency?',
    answer:
      'Absolutely. The PDF has no viewing limits—forward, print, or upload it to your project workspace as needed.',
    category: FAQCategory.PURCHASE,
    tags: ['sharing', 'team', 'collaboration', 'pdf'],
  },
]

/**
 * Technical FAQs
 */
export const TECHNICAL_FAQS: FAQItem[] = [
  {
    id: 'site-access',
    question: 'How does Anthrasite access my website?',
    answer:
      "We use headless browsers to visit your site just like a real user would. We don't require any code installation or special access. Your site just needs to be publicly accessible on the internet.",
    category: FAQCategory.TECHNICAL,
    tags: ['access', 'security', 'technical'],
  },
  {
    id: 'javascript-sites',
    question: 'Do you support JavaScript-heavy sites and SPAs?',
    answer:
      'Yes! Anthrasite fully renders JavaScript applications, including React, Vue, Angular, and other SPA frameworks. We wait for dynamic content to load and analyze the fully rendered page.',
    category: FAQCategory.TECHNICAL,
    tags: ['javascript', 'spa', 'frameworks'],
  },
  {
    id: 'mobile-analysis',
    question: 'Do you test mobile performance?',
    answer:
      'Yes, we test your site on both desktop and mobile viewports, simulating real device conditions including CPU throttling and network speeds to give you accurate mobile performance metrics.',
    category: FAQCategory.TECHNICAL,
    tags: ['mobile', 'responsive', 'testing'],
  },
  {
    id: 'data-security',
    question: 'How do you handle my website data?',
    answer:
      'We only collect publicly available data from your website. Analysis data is encrypted, stored securely, and automatically deleted after 90 days. We never store sensitive user data or passwords.',
    category: FAQCategory.TECHNICAL,
    tags: ['security', 'privacy', 'data'],
  },
  {
    id: 'api-access',
    question: 'Is there an API available?',
    answer:
      'API access is coming soon! Join our waitlist to be notified when our API launches, allowing you to integrate Anthrasite analysis into your CI/CD pipeline.',
    category: FAQCategory.TECHNICAL,
    tags: ['api', 'integration', 'automation'],
  },
]

/**
 * Report-specific FAQs
 */
export const REPORT_FAQS: FAQItem[] = [
  {
    id: 'report-format',
    question: 'What format is the report in?',
    answer:
      'Your report is available as an interactive web dashboard and can be exported as a PDF. The web version includes interactive charts, detailed breakdowns, and direct links to resources.',
    category: FAQCategory.REPORT,
    tags: ['format', 'export', 'pdf'],
  },
  {
    id: 'report-sections',
    question: 'What sections are included in the report?',
    answer:
      'The report includes an Executive Summary, Performance Metrics, Core Web Vitals, Technical SEO, Accessibility Audit, Security Assessment, Mobile Analysis, and a prioritized Action Plan with specific recommendations.',
    category: FAQCategory.REPORT,
    tags: ['sections', 'content', 'structure'],
  },
  {
    id: 'implementation-guides',
    question: 'Do you provide implementation guidance?',
    answer:
      'Yes! Each recommendation includes step-by-step implementation guides with code examples, platform-specific instructions, and links to relevant documentation.',
    category: FAQCategory.REPORT,
    tags: ['implementation', 'guides', 'help'],
  },
  {
    id: 'competitor-comparison',
    question: 'Does the report include competitor analysis?',
    answer:
      'Yes, we benchmark your site against 3 competitors of your choice, showing how you compare in key performance metrics and identifying opportunities to gain a competitive edge.',
    category: FAQCategory.REPORT,
    tags: ['competitors', 'benchmarking', 'comparison'],
  },
]

/**
 * Privacy and Security FAQs
 */
export const PRIVACY_FAQS: FAQItem[] = [
  {
    id: 'data-collection',
    question: 'What data do you collect about my website?',
    answer:
      "We only analyze publicly accessible content and performance metrics. We don't collect personal user data, form submissions, or any information behind login walls.",
    category: FAQCategory.PRIVACY,
    tags: ['privacy', 'data', 'collection'],
  },
  {
    id: 'gdpr-compliance',
    question: 'Are you GDPR compliant?',
    answer:
      'Yes, Anthrasite is fully GDPR compliant. We process data lawfully, provide transparency about data usage, and give you full control over your data including the right to deletion.',
    category: FAQCategory.PRIVACY,
    tags: ['gdpr', 'compliance', 'privacy'],
  },
  {
    id: 'data-retention',
    question: 'How long do you keep my data?',
    answer:
      'Report data is retained for 90 days to allow for re-testing and progress tracking. After 90 days, all analysis data is automatically deleted. You can request immediate deletion at any time.',
    category: FAQCategory.PRIVACY,
    tags: ['retention', 'deletion', 'data'],
  },
]

/**
 * All FAQs combined
 */
export const ALL_FAQS: FAQItem[] = [
  ...GENERAL_FAQS,
  ...PURCHASE_FAQS,
  ...TECHNICAL_FAQS,
  ...REPORT_FAQS,
  ...PRIVACY_FAQS,
]

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: FAQCategory): FAQItem[] {
  return ALL_FAQS.filter((faq) => faq.category === category)
}

/**
 * Get FAQs by page context
 */
export function getFAQsByContext(context: string): FAQItem[] {
  switch (context) {
    case 'purchase':
      return [...PURCHASE_FAQS, ...GENERAL_FAQS.slice(0, 3)]
    case 'home':
      return [...GENERAL_FAQS, ...TECHNICAL_FAQS.slice(0, 2)]
    case 'privacy':
      return [
        ...PRIVACY_FAQS,
        ...TECHNICAL_FAQS.filter((f) => f.tags?.includes('security')),
      ]
    case 'report':
      return [
        ...REPORT_FAQS,
        ...TECHNICAL_FAQS.filter((f) => f.tags?.includes('analysis')),
      ]
    default:
      return GENERAL_FAQS
  }
}

/**
 * Search FAQs by query
 */
export function searchFAQs(query: string, limit: number = 10): FAQItem[] {
  const lowerQuery = query.toLowerCase()

  return ALL_FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  ).slice(0, limit)
}
