import { model } from "@medusajs/framework/utils"

const PurchaseOrderItem = model
  .define(
    { tableName: "pbn_procurement_item", name: "PurchaseOrderItem" },
    {
      id: model.id({ prefix: "pitem" }).primaryKey(),
      order_id: model.text(),
      product_id: model.text().nullable(),
      variant_id: model.text().nullable(),
      sku: model.text().nullable(),
      product_title: model.text(),
      variant_title: model.text().nullable(),
      supplier_sku: model.text().nullable(),
      supplier_url: model.text().nullable(),
      quantity: model.number(),
      received_quantity: model.number().default(0),
      unit_cost: model.bigNumber(),
      line_total: model.bigNumber(),
      notes: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_item_order", on: ["order_id"] },
    { name: "IDX_pbn_procurement_item_product", on: ["product_id"] },
    { name: "IDX_pbn_procurement_item_variant", on: ["variant_id"] },
    { name: "IDX_pbn_procurement_item_sku", on: ["sku"] },
  ])

export default PurchaseOrderItem
