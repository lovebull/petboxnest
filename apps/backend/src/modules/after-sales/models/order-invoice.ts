import { model } from "@medusajs/framework/utils";

const OrderInvoice = model
  .define(
    { tableName: "pbn_order_invoice", name: "OrderInvoice" },
    {
      id: model.id({ prefix: "inv" }).primaryKey(),
      invoice_number: model.text().unique(),
      order_id: model.text(),
      customer_id: model.text().nullable(),
      version: model.number().default(1),
      status: model.enum(["issued", "stale", "void"]).default("issued"),
      snapshot: model.json(),
      issued_at: model.dateTime(),
      voided_at: model.dateTime().nullable(),
    },
  )
  .indexes([{ name: "IDX_pbn_invoice_order", on: ["order_id", "version"] }]);

export default OrderInvoice;
