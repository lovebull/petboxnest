import { model } from "@medusajs/framework/utils"

const ReferralConversion = model
  .define(
    { tableName: "referral_conversion", name: "ReferralConversion" },
    {
      id: model.id({ prefix: "refconv" }).primaryKey(),
      order_id: model.text().unique(),
      order_display_id: model.text(),
      attribution_id: model.text().unique(),
      participant_id: model.text(),
      referrer_customer_id: model.text(),
      referred_customer_id: model.text(),
      currency_code: model.text(),
      eligible_amount: model.bigNumber(),
      commission_amount: model.bigNumber(),
      credited_amount: model.bigNumber().default(0),
      reversed_amount: model.bigNumber().default(0),
      reversal_due: model.bigNumber().default(0),
      status: model
        .enum(["pending", "paid", "partially_reversed", "reversed", "cancelled"])
        .default("pending"),
      available_at: model.dateTime(),
      paid_at: model.dateTime().nullable(),
      store_credit_account_id: model.text().nullable(),
      rule_snapshot: model.json(),
      metadata: model.json().nullable(),
    }
  )
  .indexes([
    { name: "IDX_referral_conversion_referrer", on: ["referrer_customer_id"] },
    { name: "IDX_referral_conversion_status_available", on: ["status", "available_at"] },
  ])

export default ReferralConversion
