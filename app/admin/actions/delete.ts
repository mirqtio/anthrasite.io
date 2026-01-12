'use server'

import getSql from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteLead(id: number) {
  try {
    const sql = getSql()
    // Explicitly delete/nullify related records to handle foreign key constraints

    // Delete analytics data
    await sql`DELETE FROM email_click_events WHERE lead_id = ${id}`

    // Nullify referral relationships (preserve conversion history)
    await sql`UPDATE referral_codes SET lead_id = NULL WHERE lead_id = ${id}`
    await sql`UPDATE referral_conversions SET referee_lead_id = NULL WHERE referee_lead_id = ${id}`

    // Nullify sales relationship (preserve sales data)
    await sql`UPDATE sales SET lead_id = NULL WHERE lead_id = ${id}`

    // Delete core lead data
    await sql`DELETE FROM reports WHERE lead_id = ${id}`
    await sql`DELETE FROM runs WHERE lead_id = ${id}`
    await sql`DELETE FROM contacts WHERE lead_id = ${id}`
    await sql`DELETE FROM leads WHERE id = ${id}`

    revalidatePath('/admin/leads')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete lead:', error)
    throw new Error(error.message || 'Failed to delete lead')
  }
}
