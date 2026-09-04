import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review"
import type ProductReviewModuleService from "../../../../../modules/product-review/service"
import { createProductReviewWorkflow } from "../../../../../workflows/product-review/create-product-review"
import { pagination, type ReviewListQuery } from "../../../../product-review-helpers"

type SubmitBody = { product_id: string; rating: number; title?: string; content: string }

const customerReview = (review: Record<string, unknown>) => ({
  id: review.id,
  product_id: review.product_id,
  rating: review.rating,
  title: review.title,
  content: review.content,
  reviewer_name: review.reviewer_name,
  status: review.status,
  created_at: review.created_at,
  updated_at: review.updated_at,
})

export async function POST(req: AuthenticatedMedusaRequest<SubmitBody>, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({ entity: "customer", fields: ["first_name", "last_name"], filters: { id: req.auth_context.actor_id } })
  const customer = customers[0]
  const reviewerName = [customer?.first_name, customer?.last_name?.slice(0, 1)].filter(Boolean).join(" ") || "PetBoxNest customer"
  const reviewService = req.scope.resolve<ProductReviewModuleService>(
    PRODUCT_REVIEW_MODULE
  )
  const [existing] = await reviewService.listProductReviews({
    customer_id: req.auth_context.actor_id,
    product_id: req.validatedBody.product_id,
  })
  if (existing) {
    return res.status(409).json({
      code: "conflict",
      type: "duplicate_error",
      message: "You have already reviewed this product",
    })
  }
  try {
    const { result } = await createProductReviewWorkflow(req.scope).run({ input: { ...req.validatedBody, customer_id: req.auth_context.actor_id, reviewer_name: reviewerName } })
    res.status(201).json({ review: customerReview(result as unknown as Record<string, unknown>) })
  } catch (error) {
    if (error instanceof Error && (error as Error & { type?: string }).type === "duplicate_error") {
      return res.status(409).json({
        code: "conflict",
        type: "duplicate_error",
        message: error.message,
      })
    }
    throw error
  }
}

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const query = req.validatedQuery as ReviewListQuery
  const [reviews, count] = await service.listAndCountProductReviews({ customer_id: req.auth_context.actor_id }, { take: query.limit, skip: (query.page - 1) * query.limit, order: { created_at: "DESC" } })
  res.json({ reviews: reviews.map((review) => customerReview(review as unknown as Record<string, unknown>)), ...pagination(count, query.page, query.limit) })
}
