'use server'

import { revalidatePath } from 'next/cache'
import { getSql } from '@/lib/db'
import { leadSchema, LeadFormData } from '@/lib/schemas/lead'

export async function updateLeadDetails(leadId: number, data: LeadFormData) {
  const sql = getSql()

  // 1. Validate
  const result = leadSchema.safeParse(data)
  if (!result.success) {
    throw new Error(result.error.errors[0].message)
  }

  const {
    company,
    domain,
    url,
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

  // 2. Update Lead
  await sql`
    UPDATE leads 
    SET 
      company = ${company},
      domain = ${domain},
      url = ${url || null},
      baseline_monthly_revenue = ${baseline_monthly_revenue},
      employee_size = ${employee_size || null},
      naics_code = ${naics_code || null},
      address = ${address || null},
      city = ${city || null},
      state = ${state || null},
      zip_code = ${zip_code || null},
      source = ${source},
      updated_at = NOW()
    WHERE id = ${leadId}
  `

  // 3. Update/Insert Contacts
  // For simplicity, we'll handle updates if ID exists, insert if not.
  // Note: leadSchema doesn't explicitly enforce IDs on contacts, so we rely on the passed data.
  // However, the form data from the UI should include IDs for existing contacts.

  if (contacts && contacts.length > 0) {
    for (const contact of contacts) {
      if (contact.id) {
        // Update existing
        await sql`
          UPDATE contacts
          SET
            first_name = ${contact.first_name},
            last_name = ${contact.last_name},
            email = ${contact.email},
            title = ${contact.title || null},
            is_primary = ${contact.is_primary},
            source = ${contact.source || 'manual'},
            updated_at = NOW()
          WHERE id = ${contact.id} AND lead_id = ${leadId}
        `
      } else {
        // Insert new
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
            ${leadId},
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
  }

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin/leads')

  return { success: true }
}
