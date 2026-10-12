import { createHash } from "node:crypto"

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") return Number(value) || 0
  if (value && typeof value === "object") {
    const candidate = value as { numeric_?: unknown; value?: unknown }
    return toNumber(candidate.numeric_ ?? candidate.value)
  }
  return 0
}

export const roundAmount = (value: number) => Math.round((value + Number.EPSILON) * 10000) / 10000

export const customerKey = (customerId?: string | null, email?: string | null) => {
  if (customerId) return `customer:${customerId}`
  const normalized = email?.trim().toLowerCase()
  return normalized
    ? `email:${createHash("sha256").update(normalized).digest("hex")}`
    : null
}

export const utcDay = (value: Date | string) => new Date(value).toISOString().slice(0, 10)
