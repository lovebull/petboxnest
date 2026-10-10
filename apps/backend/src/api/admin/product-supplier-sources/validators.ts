import { z } from "@medusajs/framework/zod"

export const ProductSupplierSourceListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(160).optional(),
  provider: z.enum(["all", "1688", "taobao", "jd"]).default("all"),
  status: z.enum(["all", "configured", "missing"]).default("all"),
})

const SupplierUrlSchema = z
  .union([z.string().trim().max(2048), z.null()])
  .optional()
  .refine(
    (value) =>
      value === undefined ||
      value === null ||
      value === "" ||
      value.startsWith("http://") ||
      value.startsWith("https://"),
    "Supplier URL must use http:// or https://"
  )

export const UpdateProductSupplierSourceSchema = z.strictObject({
  supplier_1688_url: SupplierUrlSchema,
  supplier_taobao_url: SupplierUrlSchema,
  supplier_jd_url: SupplierUrlSchema,
})

export type ProductSupplierSourceListQuery = z.infer<
  typeof ProductSupplierSourceListSchema
>
export type UpdateProductSupplierSourceBody = z.infer<
  typeof UpdateProductSupplierSourceSchema
>
