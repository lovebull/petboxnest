import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import { z } from "@medusajs/framework/zod"

export const UpdateCashbackSettingsSchema = z
  .strictObject({
    name: z.string().min(1).max(120),
    is_active: z.boolean(),
    reward_type: z.enum(["percentage", "fixed"]),
    reward_value: z.number().positive(),
    currency_code: z.string().length(3),
    minimum_order_amount: z.number().min(0),
    maximum_cashback_amount: z.number().positive().nullable(),
    waiting_days: z.number().int().min(0).max(365),
    starts_at: z.iso.datetime().nullable(),
    ends_at: z.iso.datetime().nullable(),
  })
  .superRefine((data, context) => {
    if (data.reward_type === "percentage" && data.reward_value > 100) {
      context.addIssue({
        code: "custom",
        path: ["reward_value"],
        message: "Percentage cashback cannot exceed 100.",
      })
    }

    if (
      data.starts_at &&
      data.ends_at &&
      new Date(data.starts_at) >= new Date(data.ends_at)
    ) {
      context.addIssue({
        code: "custom",
        path: ["ends_at"],
        message: "End time must be after start time.",
      })
    }
  })

export type UpdateCashbackSettingsSchema = z.infer<
  typeof UpdateCashbackSettingsSchema
>

export const GetCashbackEntriesSchema = z.object({
  status: z
    .enum([
      "pending",
      "available",
      "partially_reversed",
      "reversed",
      "cancelled",
    ])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export const UpdateReferralSettingsSchema = z.strictObject({
  name: z.string().min(1).max(120),
  is_active: z.boolean(),
  commission_percentage: z.number().int().min(0).max(100),
  referee_discount_percentage: z.number().int().positive().max(100),
  promotion_code: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/),
  currency_code: z.string().length(3),
  minimum_order_amount: z.number().min(0),
  maximum_commission_amount: z.number().positive().nullable(),
  waiting_days: z.number().int().min(0).max(365),
  attribution_days: z.number().int().min(1).max(365),
  stack_with_cashback: z.boolean(),
})

export type UpdateReferralSettingsSchema = z.infer<
  typeof UpdateReferralSettingsSchema
>

export const BindReferralSchema = z.strictObject({
  code: z.string().min(3).max(40),
})

export type BindReferralSchema = z.infer<typeof BindReferralSchema>

export const UpdateCustomerEmailSchema = z.strictObject({
  email: z.email().max(320),
  current_password: z.string().min(1).max(200),
})

export type UpdateCustomerEmailSchema = z.infer<
  typeof UpdateCustomerEmailSchema
>

export const UpdateCustomerPasswordSchema = z.strictObject({
  current_password: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
})

export type UpdateCustomerPasswordSchema = z.infer<
  typeof UpdateCustomerPasswordSchema
>

const ReviewStatusSchema = z.enum(["pending", "approved", "flagged"])
const ReviewListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  status: ReviewStatusSchema.optional(),
  statuses: z.string().transform((value) => value.split(",").filter(Boolean).map((status) => ReviewStatusSchema.parse(status))).optional(),
  ratings: z.string().transform((value) => value.split(",").filter(Boolean).map((rating) => z.coerce.number().int().min(1).max(5).parse(rating))).optional(),
  product_id: z.string().min(1).optional(),
  q: z.string().trim().max(120).optional(),
  sort: z.enum(["newest", "oldest", "highest", "lowest"]).default("newest"),
  date_from: z.iso.datetime().optional(),
  date_to: z.iso.datetime().optional(),
  has_reply: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
})
const SubmitReviewSchema = z.strictObject({
  product_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  content: z.string().trim().min(10).max(2000),
})
const ModerateReviewSchema = z.strictObject({
  status: ReviewStatusSchema,
  reason: z.string().trim().min(2).max(500).nullable().optional(),
})
const BatchModerateReviewsSchema = ModerateReviewSchema.extend({
  ids: z.array(z.string().min(1)).min(1).max(100),
})
const ReviewReplySchema = z.strictObject({ content: z.string().trim().min(2).max(2000) })

const AfterSalesTypeSchema = z.enum(["cancel", "return", "exchange", "damaged_claim", "lost_claim"])
const CreateAfterSalesTypeSchema = z.enum(["cancel", "return", "damaged_claim", "lost_claim"])
const AfterSalesStatusSchema = z.enum([
  "draft", "pending_review", "approved", "rejected", "awaiting_shipment",
  "in_transit", "received", "processing_refund", "refunded",
  "replacement_processing", "completed", "cancelled",
])
const AfterSalesItemSchema = z.strictObject({
  order_item_id: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  reason_code: z.string().trim().min(1).max(80).optional(),
  exchange_variant_id: z.string().min(1).optional(),
})
const AfterSalesAttachmentSchema = z.strictObject({
  url: z.url().max(2000),
  mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  size: z.number().int().positive().max(8_000_000),
})
const AfterSalesUploadSchema = z.strictObject({
  files: z.array(z.strictObject({
    name: z.string().trim().min(1).max(180),
    mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
    size: z.number().int().positive().max(8_000_000),
  })).min(1).max(8),
})
const GuestAfterSalesUploadSchema = AfterSalesUploadSchema.extend({
  order_id: z.string().min(1),
  guest_access_token: z.string().length(64),
})
const CreateAfterSalesRequestSchema = z.strictObject({
  type: CreateAfterSalesTypeSchema,
  reason_code: z.string().trim().min(1).max(80),
  reason_text: z.string().trim().max(500).nullable().optional(),
  customer_note: z.string().trim().max(2000).nullable().optional(),
  items: z.array(AfterSalesItemSchema).max(50).default([]),
  attachment_urls: z.array(AfterSalesAttachmentSchema).max(8).optional(),
})
const CreateGuestAfterSalesRequestSchema = CreateAfterSalesRequestSchema.extend({
  order_id: z.string().min(1),
  guest_access_token: z.string().length(64),
})
const GuestCodeRequestSchema = z.strictObject({
  order_reference: z.string().trim().min(1).max(80),
  email: z.email().max(320),
})
const GuestCodeVerifySchema = z.strictObject({
  order_reference: z.string().trim().min(1).max(80),
  email: z.email().max(320),
  code: z.string().regex(/^\d{6}$/),
})
const GuestOrderBodySchema = z.strictObject({
  order_id: z.string().min(1),
  access_token: z.string().length(64),
})
const AdminAfterSalesListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: AfterSalesStatusSchema.optional(),
  type: AfterSalesTypeSchema.optional(),
  q: z.string().trim().max(120).optional(),
})
const UpdateAfterSalesStatusSchema = z.strictObject({
  status: AfterSalesStatusSchema,
  admin_note: z.string().trim().max(2000).nullable().optional(),
  customer_message: z.string().trim().max(2000).nullable().optional(),
  resolution: z.enum(["replacement", "partial_refund", "full_refund", "store_credit", "no_action"]).nullable().optional(),
  medusa_return_id: z.string().max(100).nullable().optional(),
  medusa_exchange_id: z.string().max(100).nullable().optional(),
  medusa_claim_id: z.string().max(100).nullable().optional(),
})

const CheckoutErrorResourceSchema = z.enum([
  "cart",
  "shipping_options",
  "payment_providers",
  "store_credit",
])
const CheckoutErrorResolutionSchema = z.enum(["open", "resolved", "ignored"])
const CreateCheckoutErrorSchema = z.strictObject({
  error_id: z.string().regex(/^PBN-[A-F0-9]{8}$/),
  resource: CheckoutErrorResourceSchema,
  code: z.string().trim().min(1).max(80),
  status_code: z.number().int().min(100).max(599).nullable().optional(),
  retryable: z.boolean(),
  cart_id_hash: z.string().regex(/^[a-f0-9]{12}$/).nullable().optional(),
  region_id: z.string().trim().min(1).max(120).nullable().optional(),
  country_code: z.string().trim().regex(/^[a-zA-Z]{2}$/).nullable().optional(),
  occurred_at: z.iso.datetime(),
})
const CheckoutErrorListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(120).optional(),
  resource: CheckoutErrorResourceSchema.optional(),
  resolution_status: CheckoutErrorResolutionSchema.optional(),
  retryable: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  date_from: z.iso.datetime().optional(),
  date_to: z.iso.datetime().optional(),
})
const UpdateCheckoutErrorSchema = z.strictObject({
  resolution_status: CheckoutErrorResolutionSchema,
  admin_note: z.string().trim().max(2000).nullable().optional(),
})

const AutomationListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(160).optional(),
  status: z.string().trim().max(40).optional(),
})
const CreateRestockSubscriptionSchema = z.strictObject({
  variant_id: z.string().min(1).max(120),
  email: z.email().max(320),
  consent: z.literal(true),
  consent_source: z.string().trim().min(1).max(80).optional(),
  country_code: z.string().trim().regex(/^[a-zA-Z]{2}$/).optional(),
})
const AutomationTokenSchema = z.strictObject({ token: z.string().min(20).max(2000) })

export const GetReferralConversionsSchema = z.object({
  status: z
    .enum(["pending", "paid", "partially_reversed", "reversed", "cancelled"])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/restock-subscriptions",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateRestockSubscriptionSchema)],
    },
    {
      matcher: "/store/restock-subscriptions/unsubscribe",
      method: "POST",
      middlewares: [validateAndTransformBody(AutomationTokenSchema)],
    },
    {
      matcher: "/store/cart-recovery/:action",
      method: "POST",
      middlewares: [validateAndTransformBody(AutomationTokenSchema)],
    },
    {
      matcher: "/admin/restock-notifications",
      method: "GET",
      middlewares: [validateAndTransformQuery(AutomationListSchema, {})],
    },
    {
      matcher: "/admin/cart-recoveries",
      method: "GET",
      middlewares: [validateAndTransformQuery(AutomationListSchema, {})],
    },
    {
      matcher: "/store/checkout-errors",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateCheckoutErrorSchema)],
    },
    {
      matcher: "/admin/checkout-errors",
      method: "GET",
      middlewares: [validateAndTransformQuery(CheckoutErrorListSchema, {})],
    },
    {
      matcher: "/admin/checkout-errors/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateCheckoutErrorSchema)],
    },
    {
      matcher: "/store/orders/:id/after-sales",
      method: ["GET", "POST"],
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/orders/:id/after-sales/uploads",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(AfterSalesUploadSchema),
      ],
    },
    {
      matcher: "/store/after-sales/guest/uploads",
      method: "POST",
      middlewares: [validateAndTransformBody(GuestAfterSalesUploadSchema)],
    },
    {
      matcher: "/store/orders/:id/invoice",
      method: "GET",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/after-sales/:id/cancel",
      method: "POST",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/orders/:id/after-sales",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateAfterSalesRequestSchema)],
    },
    {
      matcher: "/store/after-sales/guest/request-code",
      method: "POST",
      middlewares: [validateAndTransformBody(GuestCodeRequestSchema)],
    },
    {
      matcher: "/store/after-sales/guest/verify",
      method: "POST",
      middlewares: [validateAndTransformBody(GuestCodeVerifySchema)],
    },
    {
      matcher: "/store/after-sales/guest/order",
      method: "POST",
      middlewares: [validateAndTransformBody(GuestOrderBodySchema)],
    },
    {
      matcher: "/store/after-sales/guest/requests",
      method: "POST",
      middlewares: [validateAndTransformBody(CreateGuestAfterSalesRequestSchema)],
    },
    {
      matcher: "/admin/after-sales",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminAfterSalesListSchema, {})],
    },
    {
      matcher: "/admin/after-sales/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateAfterSalesStatusSchema)],
    },
    {
      matcher: "/admin/cashback/settings",
      method: "POST",
      middlewares: [
        validateAndTransformBody(UpdateCashbackSettingsSchema),
      ],
    },
    {
      matcher: "/admin/cashback/entries",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetCashbackEntriesSchema, {}),
      ],
    },
    {
      matcher: "/admin/referrals/settings",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateReferralSettingsSchema)],
    },
    {
      matcher: "/admin/referrals/conversions",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(GetReferralConversionsSchema, {}),
      ],
    },
    {
      matcher: "/store/carts/:id/referral",
      method: "POST",
      middlewares: [validateAndTransformBody(BindReferralSchema)],
    },
    {
      matcher: "/store/customers/me/account/email",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateCustomerEmailSchema)],
    },
    {
      matcher: "/store/customers/me/account/password",
      method: "POST",
      middlewares: [validateAndTransformBody(UpdateCustomerPasswordSchema)],
    },
    {
      matcher: "/store/products/:id/reviews",
      method: "GET",
      middlewares: [validateAndTransformQuery(ReviewListSchema.omit({ status: true, statuses: true, ratings: true, product_id: true, has_reply: true }).extend({ limit: z.coerce.number().int().min(1).max(100).default(10) }), {})],
    },
    {
      matcher: "/store/customers/me/product-reviews",
      method: "GET",
      middlewares: [validateAndTransformQuery(ReviewListSchema.pick({ page: true, limit: true }), {})],
    },
    {
      matcher: "/store/customers/me/product-reviews",
      method: "POST",
      middlewares: [validateAndTransformBody(SubmitReviewSchema)],
    },
    {
      matcher: "/admin/product-reviews",
      method: "GET",
      middlewares: [validateAndTransformQuery(ReviewListSchema, {})],
    },
    {
      matcher: "/admin/product-reviews/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(ModerateReviewSchema)],
    },
    {
      matcher: "/admin/product-reviews/batch-status",
      method: "POST",
      middlewares: [validateAndTransformBody(BatchModerateReviewsSchema)],
    },
    {
      matcher: "/admin/product-reviews/:id/reply",
      method: "POST",
      middlewares: [validateAndTransformBody(ReviewReplySchema)],
    },
  ],
})
