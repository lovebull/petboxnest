import { model } from "@medusajs/framework/utils"

const ReferralAttribution = model
  .define(
    { tableName: "referral_attribution", name: "ReferralAttribution" },
    {
      id: model.id({ prefix: "refattr" }).primaryKey(),
      participant_id: model.text(),
      referrer_customer_id: model.text(),
      referred_customer_id: model.text().nullable(),
      cart_id: model.text().unique(),
      code: model.text(),
      status: model
        .enum(["active", "converted", "expired", "rejected"])
        .default("active"),
      expires_at: model.dateTime(),
      converted_at: model.dateTime().nullable(),
      rejection_reason: model.text().nullable(),
      metadata: model.json().nullable(),
    }
  )
  .indexes([
    { name: "IDX_referral_attribution_participant", on: ["participant_id"] },
    { name: "IDX_referral_attribution_customer", on: ["referred_customer_id"] },
    { name: "IDX_referral_attribution_status_expiry", on: ["status", "expires_at"] },
  ])

export default ReferralAttribution
