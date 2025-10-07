// Barrel export for UTM hash generation
// Maps to existing UTM crypto implementation

import { generateUTMToken, createUTMParameter } from '../utm/crypto'

export interface SecureUTMData {
  business_id: string
  business_name: string
  price: number
  value: number
  campaign_id: string
  preview_pages: number
}

export async function generateSecureUTM(data: SecureUTMData): Promise<string> {
  // Use existing UTM token generation
  const token = await generateUTMToken(data.business_id)
  return createUTMParameter(token)
}
