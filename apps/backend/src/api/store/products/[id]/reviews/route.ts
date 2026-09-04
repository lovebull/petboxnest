import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import type ProductReviewModuleService from "../../../../../modules/product-review/service"
import { listReviews, pagination, type ReviewListQuery } from "../../../../product-review-helpers"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const query = req.validatedQuery as ReviewListQuery
  const { reviews, count, replyMap } = await listReviews(service, query, { product_id: req.params.id, status: "approved" })
  const [stats] = await service.listProductReviewStats({ product_id: req.params.id })
  res.json({
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      content: review.content,
      reviewer_name: review.reviewer_name,
      created_at: review.created_at,
      reply: replyMap.has(review.id) ? { content: replyMap.get(review.id)!.content, created_at: replyMap.get(review.id)!.created_at } : null,
    })),
    ...pagination(count, query.page, query.limit),
    average_rating: Number(stats?.average_rating || 0),
    rating_distribution: {
      1: stats?.rating_count_1 || 0,
      2: stats?.rating_count_2 || 0,
      3: stats?.rating_count_3 || 0,
      4: stats?.rating_count_4 || 0,
      5: stats?.rating_count_5 || 0,
    },
  })
}
