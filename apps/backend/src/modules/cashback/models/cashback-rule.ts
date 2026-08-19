import { model } from "@medusajs/framework/utils"

const CashbackRule = model
  .define(
    { tableName: "cashback_rule", name: "CashbackRule" },
    {
      id: model.id({ prefix: "cbrule" }).primaryKey(),
      key: model.text().unique(),
      name: model.text(),
      is_active: model.boolean().default(false),
      reward_type: model.enum(["percentage", "fixed"]),
      reward_value: model.bigNumber(),
      currency_code: model.text(),
      minimum_order_amount: model.bigNumber().default(0),
      maximum_cashback_amount: model.bigNumber().nullable(),
      waiting_days: model.number().default(30),
      starts_at: model.dateTime().nullable(),
      ends_at: model.dateTime().nullable(),
      metadata: model.json().nullable(),
    }
  )
  .indexes([
    {
      name: "IDX_cashback_rule_active_currency",
      on: ["is_active", "currency_code"],
    },
  ])

export default CashbackRule
