import crypto from "node:crypto"
import type { CollectionConfig, PayloadRequest } from "payload"

const bilingualLabel = (chinese: string, english: string) => ({
  en: `${chinese}\n${english}`,
  zh: `${chinese}\n${english}`,
  "zh-TW": `${chinese}\n${english}`,
})

const normalizeText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : ""

const secretsMatch = (provided: string) => {
  const expected =
    process.env.PASSWORD_RESET_AUDIT_SECRET || process.env.REVALIDATE_SECRET || ""

  if (!provided || !expected) return false

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)

  return (
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  )
}

const hashFingerprint = (fingerprint: string) =>
  crypto
    .createHmac(
      "sha256",
      process.env.PASSWORD_RESET_AUDIT_SECRET || process.env.REVALIDATE_SECRET || ""
    )
    .update(fingerprint)
    .digest("hex")

export const PasswordResetRequests: CollectionConfig = {
  slug: "password-reset-requests",
  access: {
    create: () => false,
    read: ({ req }) => Boolean(req.user),
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: ["username", "requestedAt", "ipAddress", "fingerprintHash", "deliveryStatus"],
    group: bilingualLabel("表单", "Forms"),
    listSearchableFields: ["username", "ipAddress", "fingerprintHash"],
    pagination: { defaultLimit: 25, limits: [10, 25, 50, 100] },
    useAsTitle: "username",
  },
  defaultSort: "-requestedAt",
  labels: {
    singular: bilingualLabel("密码重置记录", "Password reset request"),
    plural: bilingualLabel("密码重置记录", "Password reset requests"),
  },
  fields: [
    { name: "requestId", label: bilingualLabel("请求编号", "Request ID"), type: "text", required: true, unique: true, index: true, admin: { readOnly: true } },
    { name: "username", label: bilingualLabel("用户名（邮箱）", "Username (email)"), type: "email", required: true, index: true, admin: { readOnly: true } },
    { name: "requestedAt", label: bilingualLabel("申请时间", "Requested at"), type: "date", required: true, index: true, admin: { readOnly: true } },
    { name: "ipAddress", label: bilingualLabel("IP 地址", "IP address"), type: "text", required: true, index: true, maxLength: 128, admin: { readOnly: true } },
    { name: "browserFingerprint", label: bilingualLabel("浏览器指纹", "Browser fingerprint"), type: "textarea", required: true, maxLength: 4000, admin: { readOnly: true } },
    { name: "fingerprintHash", label: bilingualLabel("不可逆浏览器指纹哈希", "Irreversible browser fingerprint hash"), type: "text", required: true, index: true, maxLength: 64, admin: { readOnly: true } },
    { name: "userAgent", label: bilingualLabel("浏览器标识", "User agent"), type: "textarea", maxLength: 1000, admin: { readOnly: true } },
    {
      name: "deliveryStatus",
      label: bilingualLabel("邮件发送状态", "Email delivery status"),
      type: "select",
      required: true,
      defaultValue: "sent",
      index: true,
      options: [
        { label: bilingualLabel("已发送", "Sent"), value: "sent" },
        { label: bilingualLabel("发送失败", "Failed"), value: "failed" },
      ],
      admin: { readOnly: true },
    },
    { name: "resendMessageId", label: bilingualLabel("Resend 邮件编号", "Resend message ID"), type: "text", index: true, admin: { readOnly: true } },
  ],
  endpoints: [
    {
      path: "/record",
      method: "post",
      handler: async (req: PayloadRequest) => {
        if (!secretsMatch(req.headers.get("x-pbn-audit-secret") || "")) {
          return Response.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = (req.json ? await req.json().catch(() => ({})) : {}) as Record<string, unknown>
        const requestId = normalizeText(body.requestId, 80)
        const username = normalizeText(body.username, 320).toLowerCase()
        const ipAddress = normalizeText(body.ipAddress, 128) || "unknown"
        const browserFingerprint = normalizeText(body.browserFingerprint, 4000) || "unavailable"
        const userAgent = normalizeText(body.userAgent, 1000)
        const requestedAt = normalizeText(body.requestedAt, 64)
        const resendMessageId = normalizeText(body.resendMessageId, 200)

        if (!requestId || !username || !requestedAt || Number.isNaN(Date.parse(requestedAt))) {
          return Response.json({ message: "Invalid audit record" }, { status: 400 })
        }

        const existing = await req.payload.find({
          collection: "password-reset-requests",
          where: { requestId: { equals: requestId } },
          limit: 1,
          overrideAccess: true,
        })

        if (existing.docs.length) return Response.json({ status: "already_recorded" })

        const record = await req.payload.create({
          collection: "password-reset-requests",
          data: {
            requestId,
            username,
            requestedAt,
            ipAddress,
            browserFingerprint,
            fingerprintHash: hashFingerprint(browserFingerprint),
            userAgent: userAgent || undefined,
            deliveryStatus: body.deliveryStatus === "failed" ? "failed" : "sent",
            resendMessageId: resendMessageId || undefined,
          },
          overrideAccess: true,
        })

        return Response.json({ status: "recorded", id: record.id }, { status: 201 })
      },
    },
  ],
}
