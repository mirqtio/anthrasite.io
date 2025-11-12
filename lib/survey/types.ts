import { z } from 'zod'

// JWT Payload
export interface SurveyTokenPayload {
  leadId: string
  runId?: string
  jti: string
  aud: string
  scope: string
  version?: string
  batchId?: string
  iat: number
  exp: number
}

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
  q1_website_rating: z.number().min(1).max(5),
  q2_customer_attraction: z.string().min(1),
  q3_online_percentage: z.number().min(0).max(100),
})

export const afterAnswersSchema = z.object({
  q4_accuracy_rating: z.number().min(1).max(5),
  q5_most_useful: z.string().optional(),
  q6_priority_fix: z.string().min(1),
  q7_likelihood_to_act: z.number().min(1).max(5),
  q8_fair_price: z.string().min(1),
  q9_business_value: z.string().min(1),
  q10_improvements: z.string().optional(),
  q11_future_updates: z.boolean().optional(),
})

export type BeforeAnswers = z.infer<typeof beforeAnswersSchema>
export type AfterAnswers = z.infer<typeof afterAnswersSchema>
