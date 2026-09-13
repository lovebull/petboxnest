import { model } from "@medusajs/framework/utils"

const CartRecoveryLog = model
  .define(
    { tableName: "pbn_cart_recovery_log", name: "CartRecoveryLog" },
    {
      id: model.id({ prefix: "carlog" }).primaryKey(),
      recovery_id: model.text(),
      status: model.enum(["pending", "sent", "failed", "recovered"]).default("pending"),
      attempt_count: model.number().default(0),
      notification_id: model.text().nullable(),
      error_message: model.text().nullable(),
      next_retry_at: model.dateTime().nullable(),
      triggered_at: model.dateTime(),
      sent_at: model.dateTime().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_cart_recovery_log_recovery", on: ["recovery_id", "created_at"] },
    { name: "IDX_pbn_cart_recovery_log_retry", on: ["status", "next_retry_at"] },
  ])

export default CartRecoveryLog
