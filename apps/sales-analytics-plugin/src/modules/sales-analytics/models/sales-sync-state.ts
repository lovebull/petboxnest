import { model } from "@medusajs/framework/utils"

const SalesSyncState = model.define(
  { tableName: "pbn_sales_sync_state", name: "SalesSyncState" },
  {
    id: model.id({ prefix: "sasync" }).primaryKey(),
    sync_key: model.text().unique(),
    status: model.enum(["idle", "running", "completed", "failed"]).default("idle"),
    last_started_at: model.dateTime().nullable(),
    last_completed_at: model.dateTime().nullable(),
    last_error: model.text().nullable(),
    processed_count: model.number().default(0),
  }
)

export default SalesSyncState
