import type { Question } from './types'

export const BEFORE_QUESTIONS: Question[] = [
  {
    id: 'format_preference',
    type: 'multiple_choice',
    question: 'How would you prefer the audit to be structured?',
    options: [
      'Prioritized summary (top issues first)',
      'Full detailed list of everything we found',
      'Both',
      'Not sure',
    ],
    required: true,
  },
  {
    id: 'revenue_estimate_preference',
    type: 'multiple_choice',
    question:
      'Do you prefer this kind of audit to include estimated monthly revenue impact?',
    options: [
      'Yes, it helps me understand importance',
      'Neutral',
      'No, I prefer no $ estimates',
      "I don't trust $ estimates generally",
    ],
    required: true,
  },
  {
    id: 'price_fairness',
    type: 'multiple_choice',
    question: 'What would feel like a fair price for an audit like this?',
    options: [
      'Under $99',
      '$100–199',
      '$200–299',
      '$300–399',
      '$400–499',
      '$500+',
    ],
    required: true,
  },
]

export const AFTER_QUESTIONS: Question[] = [
  {
    id: 'accuracy_rating',
    type: 'rating',
    question: 'How accurate did the audit feel for your business?',
    max: 5,
    required: true,
  },
  {
    id: 'most_useful_section',
    type: 'text',
    question: 'Which part of the audit felt most useful or relevant?',
    required: false,
  },
  {
    id: 'agency_referral_interest',
    type: 'multiple_choice',
    question:
      'If you wanted help fixing some of these issues, would you want an introduction to a vetted partner?',
    options: ['Yes', 'Maybe', 'No'],
    required: true,
  },
  {
    id: 'taxonomy_usefulness',
    type: 'rating',
    question: 'Was the FIND / KNOW / CONTACT / TRUST structure helpful?',
    max: 5,
    required: false,
  },
  {
    id: 'monitoring_interest',
    type: 'multiple_choice',
    question: 'Would ongoing monitoring of these metrics be useful to you?',
    options: ['Yes', 'No', 'Not sure'],
    required: false,
  },
  {
    id: 'report_improvement_feedback',
    type: 'text',
    question: 'Anything you’d change or add to the audit?',
    required: false,
  },
  {
    id: 'one_to_one_conversation_interest',
    type: 'multiple_choice',
    question:
      'Would you be open to a brief conversation so we can better understand SMB needs and improve this tool?',
    options: ['Yes', 'Maybe', 'No'],
    required: false,
  },
]

export function getSurveyQuestions() {
  return {
    before: BEFORE_QUESTIONS,
    after: AFTER_QUESTIONS,
  }
}
