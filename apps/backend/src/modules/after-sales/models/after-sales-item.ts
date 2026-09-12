import { model } from "@medusajs/framework/utils";

const AfterSalesItem = model
  .define(
    { tableName: "pbn_after_sales_item", name: "AfterSalesItem" },
    {
      id: model.id({ prefix: "asi" }).primaryKey(),
      request_id: model.text(),
      order_item_id: model.text(),
      title: model.text(),
      thumbnail: model.text().nullable(),
      quantity: model.number(),
      reason_code: model.text().nullable(),
      exchange_variant_id: model.text().nullable(),
      unit_price: model.bigNumber(),
      refund_amount: model.bigNumber().nullable(),
    },
  )
  .indexes([
    { name: "IDX_pbn_after_sales_item_request", on: ["request_id"] },
    { name: "IDX_pbn_after_sales_item_order_item", on: ["order_item_id"] },
  ]);

export default AfterSalesItem;
