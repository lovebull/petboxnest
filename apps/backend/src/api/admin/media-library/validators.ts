import { z } from "@medusajs/framework/zod"

export const MediaLibraryListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  q: z.string().trim().max(160).optional(),
  usage: z.enum(["all", "referenced", "orphan"]).default("all"),
})

export type MediaLibraryListQuery = z.infer<typeof MediaLibraryListSchema>
