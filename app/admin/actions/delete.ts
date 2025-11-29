'use server'

import getSql from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteLead(id: number) {
  try {
    const sql = getSql()
    // Explicitly delete related records to handle NO ACTION constraints
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
