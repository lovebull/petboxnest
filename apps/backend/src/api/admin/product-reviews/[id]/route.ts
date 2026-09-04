import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../modules/product-review"
import type ProductReviewModuleService from "../../../../modules/product-review/service"
import { getReviewOrThrow } from "../../../../workflows/product-review/helpers"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const review = await getReviewOrThrow(service, req.params.id)
  const [replies, audits] = await Promise.all([
    service.listProductReviewReplies({ review_id: review.id }),
    service.listProductReviewAudits({ review_id: review.id }, { order: { created_at: "DESC" } }),
  ])
  const graph = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: products } = await graph.graph({ entity: "product", fields: ["id", "title", "thumbnail"], filters: { id: review.product_id } })
  res.json({ review: { ...review, product: products[0] || null, reply: replies[0] || null, audits } })
}
