import { model } from "@medusajs/framework/utils"

const CartRecovery = model
  .define(
    { tableName: "pbn_cart_recovery", name: "CartRecovery" },
    {
      id: model.id({ prefix: "carrec" }).primaryKey(),
      cart_id: model.text().unique(),
      email: model.text(),
      status: model.enum(["eligible", "sent", "recovered", "unsubscribed", "expired"]).default("eligible"),
      token_hash: model.text().unique(),
      token_expires_at: model.dateTime(),
      unsubscribe_token_hash: model.text().unique(),
      consent_given: model.boolean().default(false),
      consented_at: model.dateTime(),
      consent_source: model.text(),
      country_code: model.text().nullable(),
      send_count: model.number().default(0),
      last_sent_at: model.dateTime().nullable(),
      recovered_at: model.dateTime().nullable(),
      unsubscribed_at: model.dateTime().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_cart_recovery_status", on: ["status", "created_at"] },
    { name: "IDX_pbn_cart_recovery_email", on: ["email"] },
    { name: "IDX_pbn_cart_recovery_expiry", on: ["token_expires_at"] },
  ])

export default CartRecovery
