import { model } from "@medusajs/framework/utils"

const CommissionLedgerEntry = model
  .define(
    { tableName: "commission_ledger_entry", name: "CommissionLedgerEntry" },
    {
      id: model.id({ prefix: "cledger" }).primaryKey(),
      conversion_id: model.text(),
      participant_id: model.text(),
      customer_id: model.text(),
      order_id: model.text(),
      entry_type: model.enum(["accrual", "payout", "reversal", "adjustment"]),
      status: model.enum(["pending", "posted", "void"]).default("pending"),
      amount: model.bigNumber(),
      currency_code: model.text(),
      available_at: model.dateTime().nullable(),
      posted_at: model.dateTime().nullable(),
      store_credit_transaction_id: model.text().nullable(),
      idempotency_key: model.text().unique(),
      note: model.text().nullable(),
      metadata: model.json().nullable(),
    }
  )
  .indexes([
    { name: "IDX_commission_ledger_customer_status", on: ["customer_id", "status"] },
    { name: "IDX_commission_ledger_conversion", on: ["conversion_id"] },
  ])

export default CommissionLedgerEntry
