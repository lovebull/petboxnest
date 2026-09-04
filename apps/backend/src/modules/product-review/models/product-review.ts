import { model } from "@medusajs/framework/utils"

const ProductReview = model
  .define(
    { tableName: "pbn_product_review", name: "ProductReview" },
    {
      id: model.id({ prefix: "prev" }).primaryKey(),
      product_id: model.text(),
      customer_id: model.text(),
      order_id: model.text().nullable(),
      order_line_item_id: model.text().nullable(),
      rating: model.number(),
      title: model.text().nullable(),
      content: model.text(),
      reviewer_name: model.text(),
      status: model.enum(["pending", "approved", "flagged"]).default("pending"),
      moderated_by: model.text().nullable(),
      moderated_at: model.dateTime().nullable(),
      flag_reason: model.text().nullable(),
    }
  )
  .indexes([
    { name: "IDX_pbn_review_product_status_created", on: ["product_id", "status", "created_at"] },
    { name: "IDX_pbn_review_status_created", on: ["status", "created_at"] },
    { name: "IDX_pbn_review_rating_created", on: ["rating", "created_at"] },
    { name: "IDX_pbn_review_moderated_at", on: ["moderated_at"] },
  ])

export default ProductReview
