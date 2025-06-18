import { generateUTMToken as generateToken } from '@/lib/utm/crypto'

interface UTMGeneratorOptions {
  businessId: string
  businessName: string
  price: number
  expiresIn?: number
}

export async function generateUTMToken(options: UTMGeneratorOptions): Promise<string> {
  // In a real test environment, this would call your backend API
  // For now, we'll use a mock implementation
  const mockToken = Buffer.from(JSON.stringify({
    businessId: options.businessId,
    businessName: options.businessName,
    price: options.price,
    expires: Date.now() + (options.expiresIn || 24 * 60 * 60 * 1000),
    nonce: Math.random().toString(36).substring(2),
  })).toString('base64url')
  
  return mockToken
}

export function generateExpiredUTMToken(options: Omit<UTMGeneratorOptions, 'expiresIn'>): string {
  const mockToken = Buffer.from(JSON.stringify({
    businessId: options.businessId,
    businessName: options.businessName,
    price: options.price,
    expires: Date.now() - 1000, // Already expired
    nonce: Math.random().toString(36).substring(2),
  })).toString('base64url')
  
  return mockToken
}