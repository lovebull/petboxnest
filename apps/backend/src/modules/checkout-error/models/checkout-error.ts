import { model } from "@medusajs/framework/utils";

const CheckoutError = model
  .define(
    { tableName: "pbn_checkout_error", name: "CheckoutError" },
    {
      id: model.id({ prefix: "chkerr" }).primaryKey(),
      error_id: model.text().unique(),
      resource: model.enum([
        "cart",
        "shipping_options",
        "payment_providers",
        "store_credit",
      ]),
      code: model.text(),
      status_code: model.number().nullable(),
      retryable: model.boolean().default(true),
      cart_id_hash: model.text().nullable(),
      region_id: model.text().nullable(),
      country_code: model.text().nullable(),
      source: model.text().default("storefront"),
      occurred_at: model.dateTime(),
      resolution_status: model
        .enum(["open", "resolved", "ignored"])
        .default("open"),
      admin_note: model.text().nullable(),
      resolved_by: model.text().nullable(),
      resolved_at: model.dateTime().nullable(),
    },
  )
  .indexes([
    {
      name: "IDX_pbn_checkout_error_resolution_occurred",
      on: ["resolution_status", "occurred_at"],
    },
    {
      name: "IDX_pbn_checkout_error_resource_occurred",
      on: ["resource", "occurred_at"],
    },
    {
      name: "IDX_pbn_checkout_error_code_occurred",
      on: ["code", "occurred_at"],
    },
  ]);

export default CheckoutError;
