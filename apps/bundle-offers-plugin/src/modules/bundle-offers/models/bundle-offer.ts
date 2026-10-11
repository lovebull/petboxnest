import { model } from "@medusajs/framework/utils"

const BundleOffer = model
  .define({ tableName: "pbn_bundle_offer", name: "BundleOffer" }, {
    id: model.id({ prefix: "boffer" }).primaryKey(),
    product_id: model.text().unique(),
    title: model.text(),
    subtitle: model.text().nullable(),
    status: model.enum(["draft", "active", "archived"]).default("draft"),
    starts_at: model.dateTime().nullable(),
    ends_at: model.dateTime().nullable(),
    updated_by: model.text().nullable(),
  })
  .indexes([
    { name: "IDX_pbn_bundle_offer_status", on: ["status"] },
    { name: "IDX_pbn_bundle_offer_schedule", on: ["starts_at", "ends_at"] },
  ])

export default BundleOffer
