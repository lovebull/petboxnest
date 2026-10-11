import { z } from "@medusajs/framework/zod"

const optionalText = z.string().trim().max(160).nullable().optional()

export const BundleOfferComponentSchema = z.object({
  inventory_item_id: z.string().min(1),
  required_quantity: z.number().int().min(1).max(10000),
  role: z.enum(["paid", "gift"]),
  label: optionalText,
  display_order: z.number().int().min(0).optional(),
})

export const BundleOfferOptionSchema = z.object({
  variant_id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  subtitle: optionalText,
  badge: z.string().trim().max(80).nullable().optional(),
  gift_label: optionalText,
  compare_at_prices: z.record(z.string(), z.number().nonnegative()).nullable().optional(),
  display_order: z.number().int().min(0).optional(),
  is_default: z.boolean().optional(),
  is_active: z.boolean().optional(),
  components: z.array(BundleOfferComponentSchema).max(50),
})

export const UpsertBundleOfferSchema = z.object({
  product_id: z.string().min(1),
  title: z.string().trim().min(1).max(120),
  subtitle: z.string().trim().max(240).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]),
  starts_at: z.string().datetime().nullable().optional(),
  ends_at: z.string().datetime().nullable().optional(),
  options: z.array(BundleOfferOptionSchema).min(1).max(20),
})

export type UpsertBundleOfferBody = z.infer<typeof UpsertBundleOfferSchema>
