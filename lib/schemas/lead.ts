import { z } from 'zod'

export const contactSchema = z.object({
  id: z.number().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  title: z.string().optional(),
  is_primary: z.boolean().default(false),
  source: z.string().default('manual'),
})

export const leadSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  domain: z.string().min(1, 'Domain is required'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  naics_code: z.string().min(1, 'NAICS Code is required'),
  employee_size: z.number().nullable().optional(),
  baseline_monthly_revenue: z
    .number({ required_error: 'Monthly revenue is required' })
    .min(0),
  source: z.string().default('manual'),
  contacts: z.array(contactSchema).min(1, 'At least one contact is required'),
  // Read-only / System fields for display
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  cbsa_level: z.string().nullable().optional(),
  google_place_id: z.string().nullable().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type LeadFormData = z.infer<typeof leadSchema>
