import { z } from "@medusajs/framework/zod"

const optionalDate = z.iso.date().optional()

export const SalesAnalyticsQuerySchema = z.object({
  date_from: optionalDate,
  date_to: optionalDate,
  currency_code: z.string().trim().length(3).toLowerCase().optional(),
})
export type SalesAnalyticsQuery = z.infer<typeof SalesAnalyticsQuerySchema>

export const SalesOrdersQuerySchema = SalesAnalyticsQuerySchema.extend({
  page: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).default(1)
  ),
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).max(100).default(20)
  ),
  fulfillment_status: z.string().trim().max(50).optional(),
})
export type SalesOrdersQuery = z.infer<typeof SalesOrdersQuerySchema>

export const CommerceAnalyticsQuerySchema = SalesAnalyticsQuerySchema.extend({
  granularity: z.enum(["auto", "hour", "day"]).default("auto"),
})
export type CommerceAnalyticsQuery = z.infer<
  typeof CommerceAnalyticsQuerySchema
>

export const StorefrontAnalyticsEventSchema = z.strictObject({
  event_id: z.uuid(),
  event_type: z.enum([
    "page_view",
    "product_view",
    "add_to_cart",
    "checkout_started",
    "order_completed",
  ]),
  visitor_id: z.uuid(),
  session_id: z.uuid(),
  path: z.string().trim().min(1).max(500).startsWith("/").optional(),
  country_code: z.string().trim().length(2).toLowerCase().optional(),
  product_id: z.string().trim().max(100).optional(),
  variant_id: z.string().trim().max(100).optional(),
  cart_id: z.string().trim().max(100).optional(),
  order_id: z.string().trim().max(100).optional(),
})
export type StorefrontAnalyticsEventBody = z.infer<
  typeof StorefrontAnalyticsEventSchema
>

export const SalesAnalyticsSettingsSchema = z.strictObject({
  require_cookie_consent: z.boolean(),
})
export type SalesAnalyticsSettingsBody = z.infer<
  typeof SalesAnalyticsSettingsSchema
>
