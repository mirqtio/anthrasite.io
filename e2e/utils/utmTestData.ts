import crypto from 'node:crypto'

type Payload = {
  businessId: string
  timestamp: number
  nonce: string
  expires: number
}

const b64u = (b: Buffer) =>
  b
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const sign = (secret: string, data: string) =>
  b64u(crypto.createHmac('sha256', secret).update(data).digest())

export function makeValid(secret: string, p: Partial<Payload> = {}) {
  const payload: Payload = {
    businessId: p.businessId ?? 'test-biz',
    timestamp: p.timestamp ?? Date.now(),
    nonce: p.nonce ?? crypto.randomBytes(16).toString('hex'),
    expires: p.expires ?? Date.now() + 24 * 60 * 60 * 1000,
  }
  const encodedPayload = b64u(Buffer.from(JSON.stringify(payload)))
  const signature = sign(secret, encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function makeExpired(secret: string, p: Partial<Payload> = {}) {
  return makeValid(secret, { ...p, expires: Date.now() - 48 * 60 * 60 * 1000 })
}

export function makeTampered(secret: string, p?: Partial<Payload>) {
  const valid = makeValid(secret, p)
  return valid.slice(0, -1) + (valid.slice(-1) === 'A' ? 'B' : 'A')
}
