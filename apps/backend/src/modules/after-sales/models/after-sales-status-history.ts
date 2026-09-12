import { model } from "@medusajs/framework/utils";

const AfterSalesStatusHistory = model
  .define(
    {
      tableName: "pbn_after_sales_status_history",
      name: "AfterSalesStatusHistory",
    },
    {
      id: model.id({ prefix: "ash" }).primaryKey(),
      request_id: model.text(),
      from_status: model.text().nullable(),
      to_status: model.text(),
      actor_type: model.enum(["customer", "guest", "admin", "system"]),
      actor_id: model.text().nullable(),
      note: model.text().nullable(),
      public_note: model.text().nullable(),
    },
  )
  .indexes([
    {
      name: "IDX_pbn_after_sales_history_request",
      on: ["request_id", "created_at"],
    },
  ]);

export default AfterSalesStatusHistory;
