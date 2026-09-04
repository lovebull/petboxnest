import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../../modules/product-review"
import type ProductReviewModuleService from "../../../../../../modules/product-review/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const [review] = await service.listProductReviews({ id: req.params.id, customer_id: req.auth_context.actor_id })
  if (!review) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product review not found")
  res.json({ review: {
    id: review.id,
    product_id: review.product_id,
    rating: review.rating,
    title: review.title,
    content: review.content,
    reviewer_name: review.reviewer_name,
    status: review.status,
    created_at: review.created_at,
    updated_at: review.updated_at,
  } })
}
