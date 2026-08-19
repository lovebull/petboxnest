import { model } from "@medusajs/framework/utils"

const CashbackEntry = model
  .define(
    { tableName: "cashback_entry", name: "CashbackEntry" },
    {
      id: model.id({ prefix: "cbentry" }).primaryKey(),
      order_id: model.text().unique(),
      order_display_id: model.text(),
      customer_id: model.text(),
      rule_id: model.text(),
      currency_code: model.text(),
      eligible_amount: model.bigNumber(),
      pending_amount: model.bigNumber(),
      credited_amount: model.bigNumber().default(0),
      reversed_amount: model.bigNumber().default(0),
      reversal_due: model.bigNumber().default(0),
      status: model
        .enum([
          "pending",
          "available",
          "partially_reversed",
          "reversed",
          "cancelled",
        ])
        .default("pending"),
      available_at: model.dateTime(),
      released_at: model.dateTime().nullable(),
      store_credit_account_id: model.text().nullable(),
      store_credit_transaction_id: model.text().nullable(),
      reversal_transaction_id: model.text().nullable(),
      rule_snapshot: model.json(),
      metadata: model.json().nullable(),
    }
  )
  .indexes([
    {
      name: "IDX_cashback_entry_customer_currency",
      on: ["customer_id", "currency_code"],
    },
    {
      name: "IDX_cashback_entry_status_available",
      on: ["status", "available_at"],
    },
  ])

export default CashbackEntry
