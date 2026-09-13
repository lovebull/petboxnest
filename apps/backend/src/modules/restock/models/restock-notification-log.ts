import { model } from "@medusajs/framework/utils"

const RestockNotificationLog = model
  .define(
    { tableName: "pbn_restock_notification_log", name: "RestockNotificationLog" },
    {
      id: model.id({ prefix: "rstlog" }).primaryKey(),
      subscription_id: model.text(),
      status: model.enum(["pending", "sent", "failed"]).default("pending"),
      attempt_count: model.number().default(0),
      notification_id: model.text().nullable(),
      error_message: model.text().nullable(),
      next_retry_at: model.dateTime().nullable(),
      triggered_at: model.dateTime(),
      sent_at: model.dateTime().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_restock_log_subscription", on: ["subscription_id", "created_at"] },
    { name: "IDX_pbn_restock_log_retry", on: ["status", "next_retry_at"] },
  ])

export default RestockNotificationLog
