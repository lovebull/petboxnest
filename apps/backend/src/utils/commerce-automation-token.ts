import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto"
import { MedusaError } from "@medusajs/framework/utils"

export const hashAutomationToken = (token: string) =>
  createHash("sha256").update(token).digest("hex")

export const createOpaqueToken = () => randomBytes(32).toString("hex")

const getSecret = () => {
  const secret = process.env.CART_RECOVERY_SECRET || process.env.JWT_SECRET
  if (!secret) throw new MedusaError(MedusaError.Types.INVALID_DATA, "CART_RECOVERY_SECRET or JWT_SECRET must be configured")
  return secret
}

export const createRecoveryToken = (recoveryId: string, expiresAt: Date) => {
  const payload = Buffer.from(JSON.stringify({
    rid: recoveryId,
    exp: Math.floor(expiresAt.getTime() / 1000),
    nonce: randomBytes(16).toString("hex"),
  })).toString("base64url")
  const signature = createHmac("sha256", getSecret()).update(payload).digest("base64url")
  return `${payload}.${signature}`
}

export const verifyRecoveryToken = (token: string) => {
  const [payload, signature, extra] = token.split(".")
  if (!payload || !signature || extra) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid recovery token")
  const expected = createHmac("sha256", getSecret()).update(payload).digest()
  const actual = Buffer.from(signature, "base64url")
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid recovery token")
  }
  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { rid?: string; exp?: number }
  if (!parsed.rid || !parsed.exp || parsed.exp * 1000 <= Date.now()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Recovery token has expired")
  return { recovery_id: parsed.rid, expires_at: new Date(parsed.exp * 1000) }
}
