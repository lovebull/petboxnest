import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { transform } from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import type ProductReviewModuleService from "../../modules/product-review/service"

export type CreateProductReviewInput = {
  product_id: string
  customer_id: string
  reviewer_name: string
  rating: number
  title?: string | null
  content: string
}

const createProductReviewStep = createStep(
  "create-product-review",
  async (input: CreateProductReviewInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: products } = await query.graph({ entity: "product", fields: ["id"], filters: { id: input.product_id } })
    if (!products.length) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product not found")

    const service = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
    const [existing] = await service.listProductReviews({ customer_id: input.customer_id, product_id: input.product_id })
    if (existing) throw new MedusaError(MedusaError.Types.DUPLICATE_ERROR, "You have already reviewed this product")

    const review = await service.createProductReviews({
      ...input,
      title: input.title || null,
      status: "pending",
      order_id: null,
      order_line_item_id: null,
      moderated_by: null,
      moderated_at: null,
      flag_reason: null,
    })
    return new StepResponse(review, review.id)
  },
  async (id: string | undefined, { container }) => {
    if (id) await container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE).deleteProductReviews(id)
  }
)

export const createProductReviewWorkflow = createWorkflow(
  "create-product-review",
  (input: CreateProductReviewInput) => {
    const review = createProductReviewStep(input)
    const eventData = transform({ review }, ({ review }) => ({
      id: review.id,
      product_id: review.product_id,
      customer_id: review.customer_id,
    }))
    emitEventStep({
      eventName: "product_review.created",
      data: eventData,
    })
    return new WorkflowResponse(review)
  }
)
