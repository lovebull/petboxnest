import { model } from "@medusajs/framework/utils"

const ReferralProgram = model.define(
  { tableName: "referral_program", name: "ReferralProgram" },
  {
    id: model.id({ prefix: "refprog" }).primaryKey(),
    key: model.text().unique(),
    name: model.text(),
    is_active: model.boolean().default(false),
    commission_percentage: model.number().default(8),
    referee_discount_percentage: model.number().default(10),
    promotion_code: model.text().default("REFERRED10"),
    promotion_id: model.text().nullable(),
    currency_code: model.text().default("usd"),
    minimum_order_amount: model.bigNumber().default(80),
    maximum_commission_amount: model.bigNumber().nullable(),
    waiting_days: model.number().default(30),
    attribution_days: model.number().default(30),
    stack_with_cashback: model.boolean().default(false),
  }
)

export default ReferralProgram
