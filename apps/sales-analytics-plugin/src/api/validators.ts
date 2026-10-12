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
