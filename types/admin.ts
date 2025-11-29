// types/admin.ts

// ----------------------------------------------------------------------
// 1. Read Models (Manual definitions for LeadShop tables)
// ----------------------------------------------------------------------

// Subset of 'leads' table columns needed for the Master List & Detail
export interface LeadRow {
  id: number
  url: string
  domain: string | null
  company: string | null
  status?: string // Derived from runs
  phone_confidence?: number
  contact_email?: string
  linkedin_url?: string

  // Data Axle / Enrichment Fields
  baseline_monthly_revenue: number | null // Was da_location_sales_volume
  employee_size: number | null
  naics_code: string | null // Was da_primary_naics6
  city: string | null
  state: string | null
  zip_code: string | null
  address: string | null
  source: string | null

  // Location / Geo
  latitude: number | null
  longitude: number | null
  cbsa_level: string | null
  google_place_id: string | null

  created_at: Date
  updated_at: Date
}

// Subset of 'runs' table columns for Pipeline Control
export interface RunRow {
  id_str: string // The UUID run_id
  lead_id: number

  // Phase Statuses
  phase_a_status: string | null // 'PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED'
  phase_b_status: string | null
  phase_c_status: string | null
  phase_d_status: string | null

  // Artifacts
  reasoning_memo_s3_key: string | null

  // Timestamps (COALESCE logic often used for sorting)
  started_at: Date | null
  created_at: Date
}

// ----------------------------------------------------------------------
// 2. Shared Types for UI & Actions
// ----------------------------------------------------------------------

export type WorkerHealthStatus = 'ONLINE' | 'OFFLINE' | 'UNKNOWN'

export type LeadAction =
  | 'RUN_ASSESSMENT' // Triggers Phase A->B->C
  | 'GENERATE_REPORT' // Triggers Phase D (Full)
  | 'REGENERATE_PDF' // Repair: Phase D (Skip Synthesis)
  | 'RESEND_EMAIL' // Repair: Resend Artifact

export interface ManualLeadInput {
  company: string
  domain: string
  url?: string
  baseline_monthly_revenue: number
  employee_size?: number | null
  naics_code?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  source: string
  contacts: {
    first_name: string
    last_name: string
    email: string
    phone?: string
    title?: string
    is_primary: boolean
    source: string
  }[]
}

export interface BatchOperationResult {
  leadId: number
  status: 'triggered' | 'skipped' | 'error'
  reason?: string
  runId?: string
}
