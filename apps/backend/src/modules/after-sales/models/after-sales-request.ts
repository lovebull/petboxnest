import { model } from "@medusajs/framework/utils";

const AfterSalesRequest = model
  .define(
    { tableName: "pbn_after_sales_request", name: "AfterSalesRequest" },
    {
      id: model.id({ prefix: "asr" }).primaryKey(),
      request_number: model.text().unique(),
      order_id: model.text(),
      customer_id: model.text().nullable(),
      customer_email: model.text(),
      type: model.enum([
        "cancel",
        "return",
        "exchange",
        "damaged_claim",
        "lost_claim",
      ]),
      status: model
        .enum([
          "draft",
          "pending_review",
          "approved",
          "rejected",
          "awaiting_shipment",
          "in_transit",
          "received",
          "processing_refund",
          "refunded",
          "replacement_processing",
          "completed",
          "cancelled",
        ])
        .default("pending_review"),
      reason_code: model.text(),
      reason_text: model.text().nullable(),
      customer_note: model.text().nullable(),
      customer_message: model.text().nullable(),
      admin_note: model.text().nullable(),
      resolution: model
        .enum([
          "replacement",
          "partial_refund",
          "full_refund",
          "store_credit",
          "no_action",
        ])
        .nullable(),
      refund_amount: model.bigNumber().nullable(),
      currency_code: model.text(),
      medusa_return_id: model.text().nullable(),
      medusa_exchange_id: model.text().nullable(),
      medusa_claim_id: model.text().nullable(),
      moderated_by: model.text().nullable(),
      submitted_at: model.dateTime(),
      approved_at: model.dateTime().nullable(),
      completed_at: model.dateTime().nullable(),
    },
  )
  .indexes([
    { name: "IDX_pbn_after_sales_order", on: ["order_id", "created_at"] },
    { name: "IDX_pbn_after_sales_customer", on: ["customer_id", "created_at"] },
    { name: "IDX_pbn_after_sales_email", on: ["customer_email", "created_at"] },
    { name: "IDX_pbn_after_sales_status", on: ["status", "created_at"] },
    { name: "IDX_pbn_after_sales_type", on: ["type", "created_at"] },
  ]);

export default AfterSalesRequest;
