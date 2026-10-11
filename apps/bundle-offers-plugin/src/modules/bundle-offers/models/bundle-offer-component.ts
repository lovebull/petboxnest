import { model } from "@medusajs/framework/utils"

const BundleOfferComponent = model
  .define({ tableName: "pbn_bundle_offer_component", name: "BundleOfferComponent" }, {
    id: model.id({ prefix: "bcomp" }).primaryKey(),
    option_id: model.text(),
    inventory_item_id: model.text(),
    required_quantity: model.number(),
    original_required_quantity: model.number().nullable(),
    link_created_by_offer: model.boolean().default(false),
    role: model.enum(["paid", "gift"]).default("paid"),
    label: model.text().nullable(),
    display_order: model.number().default(0),
  })
  .indexes([
    { name: "IDX_pbn_bundle_component_option", on: ["option_id"] },
    { name: "IDX_pbn_bundle_component_inventory", on: ["inventory_item_id"] },
    { name: "UQ_pbn_bundle_component_option_inventory", on: ["option_id", "inventory_item_id"], unique: true },
  ])

export default BundleOfferComponent
