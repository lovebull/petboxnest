import { model } from "@medusajs/framework/utils"

const PurchaseOrder = model
  .define(
    { tableName: "pbn_procurement_order", name: "PurchaseOrder" },
    {
      id: model.id({ prefix: "porder" }).primaryKey(),
      order_number: model.text().unique(),
      supplier_id: model.text(),
      supplier_name: model.text(),
      status: model
        .enum(["draft", "ordered", "partially_received", "received", "cancelled"])
        .default("draft"),
      payment_status: model
        .enum(["unpaid", "partially_paid", "paid", "refunded"])
        .default("unpaid"),
      currency_code: model.text().default("usd"),
      base_currency_code: model.text().default("usd"),
      exchange_rate: model.bigNumber().default(1),
      subtotal: model.bigNumber().default(0),
      shipping_amount: model.bigNumber().default(0),
      tax_amount: model.bigNumber().default(0),
      discount_amount: model.bigNumber().default(0),
      other_amount: model.bigNumber().default(0),
      total_amount: model.bigNumber().default(0),
      base_total_amount: model.bigNumber().default(0),
      paid_amount: model.bigNumber().default(0),
      outstanding_amount: model.bigNumber().default(0),
      ordered_at: model.dateTime().nullable(),
      expected_at: model.dateTime().nullable(),
      received_at: model.dateTime().nullable(),
      notes: model.text().nullable(),
      created_by: model.text().nullable(),
      updated_by: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_order_supplier", on: ["supplier_id", "created_at"] },
    { name: "IDX_pbn_procurement_order_status", on: ["status", "created_at"] },
    { name: "IDX_pbn_procurement_order_payment", on: ["payment_status", "created_at"] },
    { name: "IDX_pbn_procurement_order_expected", on: ["expected_at"] },
  ])

export default PurchaseOrder
