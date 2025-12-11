'use server'

import { revalidatePath } from 'next/cache'
import { getSql } from '@/lib/db'
import { ManualLeadInput } from '@/types/admin'
import { leadSchema } from '@/lib/schemas/lead'

// ----------------------------------------------------------------------
// Server Action
// ----------------------------------------------------------------------

export async function ingestManualLead(data: ManualLeadInput) {
  const sql = getSql()

  // 1. Validate & Normalize
  const result = leadSchema.safeParse(data)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }

  const {
    url,
    domain,
    company,
    baseline_monthly_revenue,
    employee_size,
    naics_code,
    address,
    city,
    state,
    zip_code,
    source,
    contacts,
  } = result.data

  // 2. Dupe-Guard (Check URL or Domain)
  const existing = await sql`
    SELECT id, url, domain 
    FROM leads 
    WHERE domain = ${domain} OR (url IS NOT NULL AND url = ${url || null})
    LIMIT 1
  `

  if (existing.length > 0) {
    throw new Error(
      `Lead exists: ID ${existing[0].id} (${existing[0].company || existing[0].url})`
    )
  }

  // 3. Insert Lead
  // Note: baseline_monthly_revenue is stored in CENTS (matches Data Axle ingestion)
  // UI input is dollars, so we multiply by 100 here
  const [inserted] = await sql`
    INSERT INTO leads (
      url, 
      domain, 
      company, 
      baseline_monthly_revenue, 
      employee_size,
      naics_code,
      address,
      city,
      state,
      zip_code,
      source,
      created_at,
      updated_at
    ) VALUES (
      ${url || domain}, 
      ${domain}, 
      ${company}, 
      ${baseline_monthly_revenue ? baseline_monthly_revenue * 100 : 0},
      ${employee_size || null},
      ${naics_code || null},
      ${address || null},
      ${city || null},
      ${state || null},
      ${zip_code || null},
      ${source || 'manual'},
      NOW(),
      NOW()
    )
    RETURNING id
  `

  // 4. Insert Contacts
  if (contacts && contacts.length > 0) {
    for (const contact of contacts) {
      await sql`
        INSERT INTO contacts (
          lead_id,
          first_name,
          last_name,
          email,
          title,
          is_primary,
          source
        ) VALUES (
          ${inserted.id},
          ${contact.first_name},
          ${contact.last_name},
          ${contact.email},
          ${contact.title || null},
          ${contact.is_primary},
          ${contact.source || 'manual'}
        )
      `
    }
  }

  console.log(`[Admin] Ingested lead ${inserted.id} (${company})`)

  // 5. Revalidate
  revalidatePath('/admin/leads')

  return { success: true, leadId: inserted.id }
}
