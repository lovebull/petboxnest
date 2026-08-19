import { model } from "@medusajs/framework/utils"

const ReferralParticipant = model
  .define(
    { tableName: "referral_participant", name: "ReferralParticipant" },
    {
      id: model.id({ prefix: "refpart" }).primaryKey(),
      customer_id: model.text().unique(),
      code: model.text().unique(),
      is_active: model.boolean().default(true),
      metadata: model.json().nullable(),
    }
  )
  .indexes([
    { name: "IDX_referral_participant_code_active", on: ["code", "is_active"] },
  ])

export default ReferralParticipant
