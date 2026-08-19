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
  ],
})
