import crypto from "node:crypto"
import type { CollectionConfig, PayloadRequest } from "payload"

const attempts = new Map<string, number[]>()
const topics = [
  "order_support",
  "shipping_or_return",
  "product_question",
  "warranty_claim",
  "other",
] as const

const normalizeText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : ""

const normalizeEmail = (value: unknown) =>
  normalizeText(value, 320).toLowerCase()

const validEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const rateLimited = (req: PayloadRequest) => {
  const address =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const fingerprint = crypto
    .createHash("sha256")
    .update(address)
    .digest("hex")
  const now = Date.now()
  const recent = (attempts.get(fingerprint) || []).filter(
    (time) => now - time < 15 * 60 * 1000
  )

  recent.push(now)
  attempts.set(fingerprint, recent)

  return { blocked: recent.length > 5, fingerprint }
}

export const ContactSubmissions: CollectionConfig = {
  slug: "contact-submissions",
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    defaultColumns: [
      "name",
      "email",
      "topic",
      "status",
      "orderNumber",
      "createdAt",
      "actions",
    ],
    group: { en: "Customer care", zh: "客户服务", "zh-TW": "客戶服務" },
    listSearchableFields: ["name", "email", "orderNumber", "message"],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
    useAsTitle: "email",
  },
  defaultSort: "-createdAt",
  disableBulkDelete: false,
  labels: {
    singular: { en: "Contact submission", zh: "联系表单", "zh-TW": "聯絡表單" },
    plural: { en: "Contact submissions", zh: "联系表单", "zh-TW": "聯絡表單" },
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      index: true,
      options: [
        { label: { en: "New", zh: "新提交", "zh-TW": "新提交" }, value: "new" },
        { label: { en: "In progress", zh: "处理中", "zh-TW": "處理中" }, value: "in_progress" },
        { label: { en: "Resolved", zh: "已解决", "zh-TW": "已解決" }, value: "resolved" },
        { label: { en: "Spam", zh: "垃圾信息", "zh-TW": "垃圾訊息" }, value: "spam" },
      ],
    },
    { name: "name", type: "text", required: true, index: true, maxLength: 120 },
    { name: "email", type: "email", required: true, index: true },
    {
      name: "topic",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: { en: "Order support", zh: "订单支持", "zh-TW": "訂單支援" }, value: "order_support" },
        { label: { en: "Shipping or return", zh: "配送或退货", "zh-TW": "配送或退貨" }, value: "shipping_or_return" },
        { label: { en: "Product question", zh: "商品问题", "zh-TW": "商品問題" }, value: "product_question" },
        { label: { en: "Warranty claim", zh: "保修申请", "zh-TW": "保固申請" }, value: "warranty_claim" },
        { label: { en: "Other", zh: "其他", "zh-TW": "其他" }, value: "other" },
      ],
    },
    { name: "orderNumber", type: "text", index: true, maxLength: 120 },
    { name: "message", type: "textarea", required: true, maxLength: 5000 },
    {
      name: "adminNotes",
      type: "textarea",
      maxLength: 5000,
      admin: { description: "Internal notes. These are never shown to the customer." },
    },
    { name: "source", type: "text", required: true, defaultValue: "storefront-contact", index: true },
    { name: "countryCode", type: "text", index: true, maxLength: 8 },
    { name: "requestFingerprint", type: "text", admin: { hidden: true } },
    { name: "userAgent", type: "text", admin: { readOnly: true }, maxLength: 500 },
    {
      name: "actions",
      type: "ui",
      label: { en: "Actions", zh: "操作", "zh-TW": "操作" },
      admin: {
        components: {
          Cell: "/admin/components/ContactSubmissionActions#ContactSubmissionActionsCell",
          Field: "/admin/components/ContactSubmissionActions#ContactSubmissionActionsField",
        },
      },
    },
  ],
  endpoints: [
    {
      path: "/submit",
      method: "post",
      handler: async (req) => {
        const limit = rateLimited(req)

        if (limit.blocked) {
          return Response.json(
            { message: "Too many messages. Please try again in 15 minutes." },
            { status: 429 }
          )
        }

        const body = (req.json
          ? await req.json().catch(() => ({}))
          : {}) as Record<string, unknown>
        const name = normalizeText(body.name, 120)
        const email = normalizeEmail(body.email)
        const topic = normalizeText(body.topic, 40)
        const orderNumber = normalizeText(body.orderNumber, 120)
        const message = normalizeText(body.message, 5000)
        const countryCode = normalizeText(body.countryCode, 8).toLowerCase()
        const website = normalizeText(body.website, 200)

        if (website) {
          return Response.json({ status: "received" }, { status: 201 })
        }

        if (
          name.length < 2 ||
          !validEmail(email) ||
          !topics.includes(topic as (typeof topics)[number]) ||
          message.length < 10
        ) {
          return Response.json(
            { message: "Please check the form and try again." },
            { status: 400 }
          )
        }

        const submission = await req.payload.create({
          collection: "contact-submissions",
          data: {
            status: "new",
            name,
            email,
            topic: topic as (typeof topics)[number],
            orderNumber: orderNumber || undefined,
            message,
            source: "storefront-contact",
            countryCode: countryCode || undefined,
            requestFingerprint: limit.fingerprint,
            userAgent: normalizeText(req.headers.get("user-agent"), 500),
          },
          overrideAccess: true,
        })

        return Response.json(
          { status: "received", reference: String(submission.id) },
          { status: 201 }
        )
      },
    },
  ],
}
