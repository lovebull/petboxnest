import crypto from "node:crypto"
import type { CollectionConfig, PayloadRequest } from "payload"

const attempts = new Map<string, number[]>()
const hash = (value: string) => crypto.createHash("sha256").update(value).digest("hex")
const normalizeEmail = (value: unknown) => typeof value === "string" ? value.trim().toLowerCase() : ""
const validEmail = (email: string) => email.length <= 320 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const baseUrl = (port: number) => `${process.env.PUBLIC_PROTOCOL || "http"}://${process.env.PUBLIC_HOST || "127.0.0.1"}:${port}`
const redirectToStorefront = (status: string) => Response.redirect(`${(process.env.NEXT_PUBLIC_BASE_URL || baseUrl(7000)).replace(/\/$/, "")}/us?newsletter=${status}#early-access`, 302)

const rateLimited = (req: PayloadRequest) => {
  const address = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  const key = hash(address)
  const now = Date.now()
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60 * 1000)
  recent.push(now)
  attempts.set(key, recent)
  return { blocked: recent.length > 5, fingerprint: key }
}

const sendConfirmation = async (email: string, confirmToken: string, unsubscribeToken: string) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) throw new Error("Newsletter email delivery is not configured")
  const cms = (process.env.PAYLOAD_PUBLIC_SERVER_URL || baseUrl(7010)).replace(/\/$/, "")
  const confirmUrl = `${cms}/api/newsletter-subscribers/confirm?token=${encodeURIComponent(confirmToken)}`
  const unsubscribeUrl = `${cms}/api/newsletter-subscribers/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Confirm your PetBoxNest updates",
      text: `Confirm your subscription: ${confirmUrl}\n\nUnsubscribe: ${unsubscribeUrl}`,
      html: `<div style="font-family:Arial,sans-serif;color:#202433;line-height:1.6;max-width:560px;margin:auto"><h1>Welcome to the nest</h1><p>Confirm that you'd like pet-home ideas and new-product updates from PetBoxNest.</p><p><a href="${confirmUrl}" style="display:inline-block;background:#6557D9;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700">Confirm subscription</a></p><p style="font-size:13px;color:#596071">Didn't request this? <a href="${unsubscribeUrl}">Unsubscribe</a>.</p></div>`,
    }),
  })
  const result = await response.json().catch(() => ({})) as { id?: string; message?: string }
  if (!response.ok) throw new Error(result.message || "Resend rejected the message")
  return result.id || null
}

export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ["email", "status", "source", "confirmedAt", "updatedAt"],
    group: { en: "Marketing", zh: "营销", "zh-TW": "行銷" },
    useAsTitle: "email",
  },
  labels: {
    singular: { en: "Newsletter subscriber", zh: "邮件订阅者", "zh-TW": "郵件訂閱者" },
    plural: { en: "Newsletter subscribers", zh: "邮件订阅者", "zh-TW": "郵件訂閱者" },
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    { name: "status", type: "select", required: true, defaultValue: "pending", index: true, options: [
      { label: { en: "Pending", zh: "待确认", "zh-TW": "待確認" }, value: "pending" },
      { label: { en: "Subscribed", zh: "已订阅", "zh-TW": "已訂閱" }, value: "subscribed" },
      { label: { en: "Unsubscribed", zh: "已退订", "zh-TW": "已退訂" }, value: "unsubscribed" },
    ] },
    { name: "source", type: "text", required: true, defaultValue: "homepage" },
    { name: "consentAt", type: "date", required: true },
    { name: "confirmedAt", type: "date" },
    { name: "unsubscribedAt", type: "date" },
    { name: "confirmationExpiresAt", type: "date", admin: { readOnly: true } },
    { name: "confirmationTokenHash", type: "text", index: true, admin: { hidden: true } },
    { name: "unsubscribeTokenHash", type: "text", index: true, admin: { hidden: true } },
    { name: "lastEmailSentAt", type: "date", admin: { readOnly: true } },
    { name: "resendMessageId", type: "text", admin: { readOnly: true } },
    { name: "lastDeliveryError", type: "textarea", admin: { readOnly: true } },
    { name: "requestFingerprint", type: "text", admin: { hidden: true } },
  ],
  endpoints: [
    { path: "/subscribe", method: "post", handler: async (req) => {
      const limit = rateLimited(req)
      if (limit.blocked) return Response.json({ message: "Too many attempts. Please try again in 15 minutes." }, { status: 429 })
      const body = (req.json ? await req.json().catch(() => ({})) : {}) as { email?: unknown; source?: unknown; consent?: unknown }
      const email = normalizeEmail(body.email)
      if (!validEmail(email) || body.consent !== true) return Response.json({ message: "Enter a valid email and accept the privacy notice." }, { status: 400 })
      const found = await req.payload.find({ collection: "newsletter-subscribers", where: { email: { equals: email } }, limit: 1 })
      const existing = found.docs[0]
      if (existing?.status === "subscribed") return Response.json({ status: "already_subscribed" })
      const confirmToken = crypto.randomBytes(32).toString("base64url")
      const unsubscribeToken = crypto.randomBytes(32).toString("base64url")
      const now = new Date()
      const data = {
        email,
        status: "pending" as const,
        source: typeof body.source === "string" ? body.source.slice(0, 80) : "homepage",
        consentAt: now.toISOString(),
        confirmedAt: null,
        unsubscribedAt: null,
        confirmationExpiresAt: new Date(now.getTime() + 86400000).toISOString(),
        confirmationTokenHash: hash(confirmToken),
        unsubscribeTokenHash: hash(unsubscribeToken),
        requestFingerprint: limit.fingerprint,
        lastDeliveryError: null,
      }
      const saved = existing
        ? await req.payload.update({ collection: "newsletter-subscribers", id: existing.id, data })
        : await req.payload.create({ collection: "newsletter-subscribers", data })
      try {
        const messageId = await sendConfirmation(email, confirmToken, unsubscribeToken)
        await req.payload.update({ collection: "newsletter-subscribers", id: saved.id, data: { lastEmailSentAt: now.toISOString(), resendMessageId: messageId } })
      } catch (error) {
        await req.payload.update({ collection: "newsletter-subscribers", id: saved.id, data: { lastDeliveryError: error instanceof Error ? error.message.slice(0, 500) : "Unknown delivery error" } })
        return Response.json({ message: "We saved your email but couldn't send the confirmation. Please try again." }, { status: 503 })
      }
      return Response.json({ status: "confirmation_sent" }, { status: 201 })
    } },
    { path: "/confirm", method: "get", handler: async (req) => {
      const token = new URL(req.url || baseUrl(7010)).searchParams.get("token") || ""
      if (!token) return redirectToStorefront("invalid")
      const found = await req.payload.find({ collection: "newsletter-subscribers", where: { confirmationTokenHash: { equals: hash(token) } }, limit: 1 })
      const subscriber = found.docs[0]
      if (!subscriber?.confirmationExpiresAt || new Date(subscriber.confirmationExpiresAt).getTime() < Date.now()) return redirectToStorefront("invalid")
      await req.payload.update({ collection: "newsletter-subscribers", id: subscriber.id, data: { status: "subscribed", confirmedAt: new Date().toISOString(), confirmationTokenHash: null } })
      return redirectToStorefront("confirmed")
    } },
    { path: "/unsubscribe", method: "get", handler: async (req) => {
      const token = new URL(req.url || baseUrl(7010)).searchParams.get("token") || ""
      if (!token) return redirectToStorefront("invalid")
      const found = await req.payload.find({ collection: "newsletter-subscribers", where: { unsubscribeTokenHash: { equals: hash(token) } }, limit: 1 })
      const subscriber = found.docs[0]
      if (!subscriber) return redirectToStorefront("invalid")
      await req.payload.update({ collection: "newsletter-subscribers", id: subscriber.id, data: { status: "unsubscribed", unsubscribedAt: new Date().toISOString(), confirmationTokenHash: null } })
      return redirectToStorefront("unsubscribed")
    } },
  ],
}
