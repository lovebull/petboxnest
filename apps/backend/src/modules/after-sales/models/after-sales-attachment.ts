import { model } from "@medusajs/framework/utils";

const AfterSalesAttachment = model
  .define(
    { tableName: "pbn_after_sales_attachment", name: "AfterSalesAttachment" },
    {
      id: model.id({ prefix: "asa" }).primaryKey(),
      request_id: model.text(),
      url: model.text(),
      mime_type: model.text(),
      size: model.number(),
      uploaded_by: model.text(),
    },
  )
  .indexes([
    { name: "IDX_pbn_after_sales_attachment_request", on: ["request_id"] },
  ]);

export default AfterSalesAttachment;
