import type { Question } from './types'

export const BEFORE_QUESTIONS: Question[] = [
  {
    id: 'q1_website_rating',
    type: 'rating',
    question:
      "How would you rate your business's website and Google presence overall?",
    description: '1 = Terrible · 5 = Excellent',
    max: 5,
    required: true,
  },
  {
    id: 'q2_customer_attraction',
    type: 'multiple_choice',
    question: 'How do you usually attract new customers?',
    options: [
      'Word-of-mouth / referrals',
      'Google / web search',
      'Social media',
      'Ads (online or offline)',
    ],
    allowOther: true,
    required: true,
  },
  {
    id: 'q3_online_percentage',
    type: 'slider',
    question:
      'About what percentage of your new customers find you online (through your website or Google)?',
    min: 0,
    max: 100,
    required: true,
  },
]

export const AFTER_QUESTIONS: Question[] = [
  {
    id: 'q4_accuracy_rating',
    type: 'rating',
    question: 'How accurate did the report feel for your business?',
    description: '1 = Way off · 5 = Spot on',
    max: 5,
    required: true,
  },
  {
    id: 'q5_most_useful',
    type: 'text',
    question: 'What part of the report felt most useful or surprising?',
    placeholder: 'Your answer...',
    required: false,
  },
  {
    id: 'q6_priority_fix',
    type: 'multiple_choice',
    question:
      'If you could fix only one thing next on your website or Google presence, what would it be?',
    options: [
      'Google Business Profile',
      'Website content / structure',
      'SEO visibility',
      'Speed / mobile experience',
      'Reviews / trust signals',
    ],
    allowOther: true,
    required: true,
  },
  {
    id: 'q7_likelihood_to_act',
    type: 'rating',
    question:
      'How likely are you to act on the recommendations in the next 60 days?',
    description: '1 = Not at all · 5 = Already started',
    max: 5,
    required: true,
  },
  {
    id: 'q8_fair_price',
    type: 'multiple_choice',
    question:
      "If you hadn't received this report for free, what do you think a fair price would be?",
    options: [
      "$0 (I wouldn't pay for this)",
      '$99',
      '$199',
      '$399',
      '$599',
      '$799+',
    ],
    allowOther: true,
    required: true,
  },
  {
    id: 'q9_business_value',
    type: 'multiple_choice',
    question:
      'Roughly how much value do you think this report could unlock for your business if you acted on its insights?',
    options: [
      'None',
      'Under $1,000',
      '$1,000–$5,000',
      '$5,000–$20,000',
      'Over $20,000',
    ],
    required: true,
  },
  {
    id: 'q10_improvements',
    type: 'text',
    question:
      'What could we add or change to make this report more useful for your business?',
    placeholder: 'Your suggestions...',
    multiline: true,
    required: false,
  },
  {
    id: 'q11_future_updates',
    type: 'checkbox',
    question:
      'Would you like to receive future updates from Anthrasite, including new report features and insights?',
    options: ['Yes, keep me updated'],
    required: false,
  },
]

export function getSurveyQuestions() {
  return {
    before: BEFORE_QUESTIONS,
    after: AFTER_QUESTIONS,
  }
}
