import { model } from "@medusajs/framework/utils"

const BundleOfferOption = model
  .define({ tableName: "pbn_bundle_offer_option", name: "BundleOfferOption" }, {
    id: model.id({ prefix: "bopt" }).primaryKey(),
    offer_id: model.text(),
    variant_id: model.text(),
    title: model.text(),
    subtitle: model.text().nullable(),
    badge: model.text().nullable(),
    gift_label: model.text().nullable(),
    compare_at_prices: model.json().nullable(),
    display_order: model.number().default(0),
    is_default: model.boolean().default(false),
    is_active: model.boolean().default(true),
  })
  .indexes([
    { name: "IDX_pbn_bundle_option_offer_order", on: ["offer_id", "display_order"] },
    { name: "IDX_pbn_bundle_option_variant", on: ["variant_id"] },
    { name: "UQ_pbn_bundle_option_offer_variant", on: ["offer_id", "variant_id"], unique: true },
  ])

export default BundleOfferOption
