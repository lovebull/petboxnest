import { model } from "@medusajs/framework/utils"

const RestockSubscription = model
  .define(
    { tableName: "pbn_restock_subscription", name: "RestockSubscription" },
    {
      id: model.id({ prefix: "rstsub" }).primaryKey(),
      subscription_key: model.text().unique(),
      variant_id: model.text(),
      sales_channel_id: model.text(),
      email: model.text(),
      customer_id: model.text().nullable(),
      country_code: model.text().nullable(),
      status: model.enum(["active", "notified", "unsubscribed"]).default("active"),
      consent_given: model.boolean().default(false),
      consented_at: model.dateTime(),
      consent_source: model.text(),
      unsubscribe_token_hash: model.text().unique(),
      last_notified_at: model.dateTime().nullable(),
      unsubscribed_at: model.dateTime().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_restock_status_created", on: ["status", "created_at"] },
    { name: "IDX_pbn_restock_variant_status", on: ["variant_id", "status"] },
    { name: "IDX_pbn_restock_email", on: ["email"] },
  ])

export default RestockSubscription
