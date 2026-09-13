import { model } from "@medusajs/framework/utils"

const StorefrontError = model
  .define(
    { tableName: "pbn_storefront_error", name: "StorefrontError" },
    {
      id: model.id({ prefix: "sferr" }).primaryKey(),
      error_id: model.text().unique(),
      scope: model.enum([
        "root",
        "country",
        "main",
        "product-detail",
        "articles",
        "account",
        "cart",
        "checkout",
      ]),
      code: model.text(),
      retryable: model.boolean().default(true),
      country_code: model.text().nullable(),
      route_key: model.text(),
      digest: model.text().nullable(),
      source: model.text().default("storefront"),
      occurred_at: model.dateTime(),
      resolution_status: model
        .enum(["open", "resolved", "ignored"])
        .default("open"),
      admin_note: model.text().nullable(),
      resolved_by: model.text().nullable(),
      resolved_at: model.dateTime().nullable(),
    },
  )
  .indexes([
    {
      name: "IDX_pbn_storefront_error_resolution_occurred",
      on: ["resolution_status", "occurred_at"],
    },
    {
      name: "IDX_pbn_storefront_error_scope_occurred",
      on: ["scope", "occurred_at"],
    },
    {
      name: "IDX_pbn_storefront_error_code_occurred",
      on: ["code", "occurred_at"],
    },
  ])

export default StorefrontError
