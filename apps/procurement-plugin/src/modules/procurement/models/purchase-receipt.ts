import { model } from "@medusajs/framework/utils"

const PurchaseReceipt = model
  .define(
    { tableName: "pbn_procurement_receipt", name: "PurchaseReceipt" },
    {
      id: model.id({ prefix: "preceipt" }).primaryKey(),
      order_id: model.text(),
      receipt_number: model.text().unique(),
      warehouse_name: model.text().nullable(),
      received_at: model.dateTime(),
      notes: model.text().nullable(),
      created_by: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_receipt_order", on: ["order_id", "received_at"] },
  ])

export default PurchaseReceipt
