import crypto from "node:crypto";
type Payload = { business_id: string; price: number; campaign_id: string; expires: number; nonce: string; };
const b64u = (b: Buffer) => b.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const sign = (secret: string, data: string) => b64u(crypto.createHmac("sha256", secret).update(data).digest());
export function makeValid(secret: string, p: Partial<Payload> = {}) {
  const payload: Payload = {
    business_id: p.business_id ?? "test-biz",
    price: p.price ?? 49900,
    campaign_id: p.campaign_id ?? "test-camp",
    expires: Date.now() + 24*60*60*1000,
    nonce: p.nonce ?? crypto.randomBytes(8).toString("hex"),
  };
  const data = JSON.stringify(payload);
  const signature = sign(secret, data);
  return b64u(Buffer.from(JSON.stringify({ ...payload, signature })));
}
export function makeExpired(secret: string, p: Partial<Payload> = {}) {
  return makeValid(secret, { ...p, expires: Date.now() - 48*60*60*1000 });
}
export function makeTampered(secret: string, p?: Partial<Payload>) {
  const valid = makeValid(secret, p);
  return valid.slice(0, -1) + (valid.slice(-1) === "A" ? "B" : "A");
}
