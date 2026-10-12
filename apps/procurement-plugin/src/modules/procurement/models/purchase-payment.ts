import { model } from "@medusajs/framework/utils"

const PurchasePayment = model
  .define(
    { tableName: "pbn_procurement_payment", name: "PurchasePayment" },
    {
      id: model.id({ prefix: "ppay" }).primaryKey(),
      order_id: model.text(),
      amount: model.bigNumber(),
      currency_code: model.text(),
      payment_method: model.text().nullable(),
      transaction_reference: model.text().nullable(),
      paid_at: model.dateTime(),
      notes: model.text().nullable(),
      created_by: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_procurement_payment_order", on: ["order_id", "paid_at"] },
  ])

export default PurchasePayment
