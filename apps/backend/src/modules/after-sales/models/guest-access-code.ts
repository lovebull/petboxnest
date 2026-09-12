import { model } from "@medusajs/framework/utils";

const GuestAccessCode = model
  .define(
    { tableName: "pbn_after_sales_guest_code", name: "GuestAccessCode" },
    {
      id: model.id({ prefix: "agc" }).primaryKey(),
      order_id: model.text(),
      email: model.text(),
      code_hash: model.text(),
      access_token_hash: model.text().nullable(),
      expires_at: model.dateTime(),
      verified_at: model.dateTime().nullable(),
      attempts: model.number().default(0),
      consumed_at: model.dateTime().nullable(),
    },
  )
  .indexes([
    {
      name: "IDX_pbn_after_sales_code_order_email",
      on: ["order_id", "email", "created_at"],
    },
    { name: "IDX_pbn_after_sales_access_token", on: ["access_token_hash"] },
  ]);

export default GuestAccessCode;
