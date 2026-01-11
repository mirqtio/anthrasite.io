import { z } from 'zod'

// JWT Payload
export interface SurveyTokenPayload {
  leadId?: string
  runId?: string
  jti: string
  aud: string
  scope: string
  iss?: string // Issuer (e.g., 'leadshop' for report tokens)
  version?: string
  batchId?: string
  source?: string
  respondentId?: string
  iat: number
  exp: number
}

// Valid token audiences
export const VALID_AUDIENCES = ['survey', 'report'] as const
export type TokenAudience = (typeof VALID_AUDIENCES)[number]

// Valid token scopes
// - feedback: Survey submission access (30-day, issued by survey page)
// - report:download: Report PDF download access (90-day, issued by LeadShop)
// - survey:access: Stable survey permalink access (90-day, issued by LeadShop for reply automation)
export const VALID_SCOPES = [
  'feedback',
  'report:download',
  'survey:access',
] as const
export type TokenScope = (typeof VALID_SCOPES)[number]

// Question Types
export type QuestionType =
  | 'rating'
  | 'multiple_choice'
  | 'slider'
  | 'text'
  | 'checkbox'

export interface BaseQuestion {
  id: string
  type: QuestionType
  question: string
  description?: string
  required: boolean
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating'
  max: number
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice'
  options: string[]
  allowOther?: boolean
}

export interface SliderQuestion extends BaseQuestion {
  type: 'slider'
  min: number
  max: number
}

export interface TextQuestion extends BaseQuestion {
  type: 'text'
  placeholder?: string
  multiline?: boolean
}

export interface CheckboxQuestion extends BaseQuestion {
  type: 'checkbox'
  options: string[]
}

export type Question =
  | RatingQuestion
  | MultipleChoiceQuestion
  | SliderQuestion
  | TextQuestion
  | CheckboxQuestion

// Survey State
export type SurveyStep =
  | 'loading'
  | 'before'
  | 'report'
  | 'after'
  | 'thank-you'
  | 'error'

export interface SurveyMetrics {
  time_before_ms?: number
  time_after_ms?: number
  time_to_report_click?: number
  screen_width?: number
  screen_height?: number
  user_agent?: string
}

// Validation Schemas
export const beforeAnswersSchema = z.object({
  format_preference: z.string().min(1),
  revenue_estimate_preference: z.string().min(1),
  price_fairness: z.string().min(1),
})

export const afterAnswersSchema = z.object({
  accuracy_rating: z.number().min(1).max(5),
  most_useful_section: z.string().optional(),
  agency_referral_interest: z.string().min(1),
  taxonomy_usefulness: z.number().min(1).max(5).optional(),
  monitoring_interest: z.string().optional(),
  report_improvement_feedback: z.string().optional(),
  one_to_one_conversation_interest: z.string().optional(),
})

export type BeforeAnswers = z.infer<typeof beforeAnswersSchema>
export type AfterAnswers = z.infer<typeof afterAnswersSchema>
