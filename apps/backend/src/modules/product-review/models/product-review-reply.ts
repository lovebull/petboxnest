import { model } from "@medusajs/framework/utils"

const ProductReviewReply = model.define(
  { tableName: "pbn_product_review_reply", name: "ProductReviewReply" },
  {
    id: model.id({ prefix: "preply" }).primaryKey(),
    review_id: model.text(),
    content: model.text(),
    created_by: model.text(),
    updated_by: model.text(),
  }
)

export default ProductReviewReply
