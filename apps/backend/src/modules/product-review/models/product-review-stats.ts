import { model } from "@medusajs/framework/utils"

const ProductReviewStats = model.define(
  { tableName: "pbn_product_review_stats", name: "ProductReviewStats" },
  {
    id: model.id({ prefix: "prstat" }).primaryKey(),
    product_id: model.text().unique(),
    average_rating: model.number().default(0),
    review_count: model.number().default(0),
    rating_count_1: model.number().default(0),
    rating_count_2: model.number().default(0),
    rating_count_3: model.number().default(0),
    rating_count_4: model.number().default(0),
    rating_count_5: model.number().default(0),
  }
)

export default ProductReviewStats
