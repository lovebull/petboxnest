import { z } from "@medusajs/framework/zod"

const optionalText = z.string().trim().max(2000).nullable().optional()
const optionalUrl = z.union([z.url(), z.literal(""), z.null()]).optional()
const optionalDate = z.union([z.iso.datetime(), z.literal(""), z.null()]).optional()
const amount = z.number().min(0).max(999999999)

export const SupplierSchema = z.strictObject({
  code: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).max(200),
  status: z.enum(["active", "inactive"]).optional(),
  contact_name: optionalText,
  email: z.union([z.email(), z.literal(""), z.null()]).optional(),
  phone: optionalText,
  website_url: optionalUrl,
  supplier_1688_url: optionalUrl,
  supplier_taobao_url: optionalUrl,
  supplier_jd_url: optionalUrl,
  default_currency_code: z.string().trim().length(3).optional(),
  payment_terms: optionalText,
  notes: optionalText,
})
export type SupplierBody = z.infer<typeof SupplierSchema>

export const PurchaseOrderItemSchema = z.strictObject({
  product_id: optionalText,
  variant_id: optionalText,
  sku: optionalText,
  product_title: z.string().trim().min(1).max(500),
  variant_title: optionalText,
  supplier_sku: optionalText,
  supplier_url: optionalUrl,
  quantity: z.number().int().min(1).max(1000000),
  unit_cost: amount,
  notes: optionalText,
})

export const PurchaseOrderSchema = z.strictObject({
  order_number: z.string().trim().min(1).max(80).optional(),
  supplier_id: z.string().trim().min(1),
  currency_code: z.string().trim().length(3),
  base_currency_code: z.string().trim().length(3).optional(),
  exchange_rate: z.number().positive().max(1000000).optional(),
  shipping_amount: amount.optional(),
  tax_amount: amount.optional(),
  discount_amount: amount.optional(),
  other_amount: amount.optional(),
  ordered_at: optionalDate,
  expected_at: optionalDate,
  notes: optionalText,
  items: z.array(PurchaseOrderItemSchema).min(1).max(500),
})
export type PurchaseOrderBody = z.infer<typeof PurchaseOrderSchema>

export const ChangePurchaseOrderStatusSchema = z.strictObject({
  status: z.enum(["draft", "ordered", "partially_received", "received", "cancelled"]),
})
export type ChangePurchaseOrderStatusBody = z.infer<
  typeof ChangePurchaseOrderStatusSchema
>

export const RecordPurchasePaymentSchema = z.strictObject({
  amount: z.number().positive().max(999999999),
  currency_code: z.string().trim().length(3),
  payment_method: optionalText,
  transaction_reference: optionalText,
  paid_at: optionalDate,
  notes: optionalText,
})
export type RecordPurchasePaymentBody = z.infer<typeof RecordPurchasePaymentSchema>

export const RecordPurchaseReceiptSchema = z.strictObject({
  receipt_number: z.string().trim().min(1).max(80).optional(),
  warehouse_name: optionalText,
  received_at: optionalDate,
  notes: optionalText,
  items: z
    .array(
      z.strictObject({
        order_item_id: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(1000000),
        notes: optionalText,
      })
    )
    .min(1)
    .max(500),
})
export type RecordPurchaseReceiptBody = z.infer<typeof RecordPurchaseReceiptSchema>

const pageNumber = (fallback: number) =>
  z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).default(fallback)
  )

export const ProcurementListQuerySchema = z.object({
  page: pageNumber(1),
  limit: z.preprocess(
    (value) => (typeof value === "string" ? Number(value) : value),
    z.number().int().min(1).max(100).default(20)
  ),
  q: z.string().trim().max(200).optional(),
  status: z.string().trim().max(50).optional(),
  payment_status: z.string().trim().max(50).optional(),
  supplier_id: z.string().trim().optional(),
  date_from: z.string().trim().optional(),
  date_to: z.string().trim().optional(),
})
export type ProcurementListQuery = z.infer<typeof ProcurementListQuerySchema>

export const ProcurementAnalyticsQuerySchema = z.object({
  date_from: z.string().trim().optional(),
  date_to: z.string().trim().optional(),
})
export type ProcurementAnalyticsQuery = z.infer<
  typeof ProcurementAnalyticsQuerySchema
>
