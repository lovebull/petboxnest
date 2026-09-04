import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../modules/product-review"
import type ProductReviewModuleService from "../../../modules/product-review/service"
import { listReviews, pagination, type ReviewListQuery } from "../../product-review-helpers"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const query = req.validatedQuery as ReviewListQuery
  const { reviews, count, replyMap } = await listReviews(service, query)
  const productIds = [...new Set(reviews.map((review) => review.product_id))]
  const graph = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = productIds.length ? await graph.graph({ entity: "product", fields: ["id", "title", "thumbnail"], filters: { id: productIds } }) : { data: [] }
  const productMap = new Map(products.map((product) => [product.id, product]))
  const summary = await service.getProductReviewSummary()
  res.json({
    reviews: reviews.map((review) => ({ ...review, product: productMap.get(review.product_id) || null, reply: replyMap.get(review.id) || null })),
    ...pagination(count, query.page, query.limit),
    summary,
  })
}
