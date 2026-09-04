import {
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
