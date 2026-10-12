import { model } from "@medusajs/framework/utils"

const PurchaseReceiptItem = model
  .define(
    { tableName: "pbn_procurement_receipt_item", name: "PurchaseReceiptItem" },
    {
      id: model.id({ prefix: "pritem" }).primaryKey(),
      receipt_id: model.text(),
      order_item_id: model.text(),
      quantity: model.number(),
      notes: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_receipt_item_receipt", on: ["receipt_id"] },
    { name: "IDX_pbn_procurement_receipt_item_order_item", on: ["order_item_id"] },
  ])

export default PurchaseReceiptItem
