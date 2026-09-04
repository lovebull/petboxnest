import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { randomUUID } from "node:crypto"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import type ProductReviewModuleService from "../../modules/product-review/service"
import type { ReviewStatus } from "../../modules/product-review/types"
import { getReviewOrThrow } from "./helpers"
import { recalculateProductReviewStatsWorkflow } from "./recalculate-product-review-stats"
import { invalidateProductReviewCacheWorkflow } from "./invalidate-product-review-cache"

export type ModerateProductReviewInput = { id: string; status: ReviewStatus; reason?: string | null; admin_user_id: string }

const moderateProductReviewStep = createStep(
  "moderate-product-review",
  async (input: ModerateProductReviewInput, { container }) => {
    const service = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
    const previous = await getReviewOrThrow(service, input.id)
    if (input.status === "flagged" && !input.reason?.trim()) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "A reason is required when flagging a review")
    }
    const review = await service.updateProductReviews({
      id: input.id,
      status: input.status,
      moderated_by: input.admin_user_id,
      moderated_at: new Date(),
      flag_reason: input.status === "flagged" ? input.reason!.trim() : null,
    })
    await service.createProductReviewAudits({
      review_id: input.id,
      admin_user_id: input.admin_user_id,
      action: input.status === "approved" ? "approve" : input.status === "flagged" ? "flag" : "restore_pending",
      previous_status: previous.status,
      new_status: input.status,
      reason: input.reason?.trim() || null,
      batch_id: null,
    })
    return new StepResponse(review)
  }
)

export const moderateProductReviewWorkflow = createWorkflow(
  "moderate-product-review",
  (input: ModerateProductReviewInput) => {
    const review = moderateProductReviewStep(input)
    const statsInput = transform({ review }, ({ review }) => ({
      product_ids: [review.product_id],
    }))
    recalculateProductReviewStatsWorkflow.runAsStep({ input: statsInput })
    invalidateProductReviewCacheWorkflow.runAsStep({ input: statsInput })
    return new WorkflowResponse(review)
  }
)

export type BatchModerateProductReviewsInput = { ids: string[]; status: ReviewStatus; reason?: string | null; admin_user_id: string }
const batchModerateStep = createStep("batch-moderate", async (input: BatchModerateProductReviewsInput, { container }) => {
  const service = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  if (input.status === "flagged" && !input.reason?.trim()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "A reason is required when flagging reviews")
  const batchId = randomUUID()
  const reviews = await Promise.all(input.ids.map((id) => getReviewOrThrow(service, id)))
  let auditIds: string[] = []
  try {
    const updated = await service.updateProductReviews(input.ids.map((id) => ({ id, status: input.status, moderated_by: input.admin_user_id, moderated_at: new Date(), flag_reason: input.status === "flagged" ? input.reason!.trim() : null })))
    const audits = await service.createProductReviewAudits(reviews.map((review) => ({ review_id: review.id, admin_user_id: input.admin_user_id, action: input.status === "approved" ? "approve" : input.status === "flagged" ? "flag" : "restore_pending", previous_status: review.status, new_status: input.status, reason: input.reason?.trim() || null, batch_id: batchId })))
    auditIds = audits.map((audit) => audit.id)
    const productIds = [...new Set(reviews.map((review) => review.product_id))]
    return new StepResponse(
      { reviews: updated, success_count: updated.length, failure_count: 0, batch_id: batchId, product_ids: productIds },
      { previous: reviews, auditIds }
    )
  } catch (error) {
    if (auditIds.length) await service.deleteProductReviewAudits(auditIds)
    await service.updateProductReviews(reviews.map((review) => ({
      id: review.id,
      status: review.status,
      moderated_by: review.moderated_by,
      moderated_at: review.moderated_at ? new Date(review.moderated_at) : null,
      flag_reason: review.flag_reason,
    })))
    throw error
  }
}, async (compensation, { container }) => {
  if (!compensation) return
  const service = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  if (compensation.auditIds.length) await service.deleteProductReviewAudits(compensation.auditIds)
  await service.updateProductReviews(compensation.previous.map((review) => ({
    id: review.id,
    status: review.status,
    moderated_by: review.moderated_by,
    moderated_at: review.moderated_at ? new Date(review.moderated_at) : null,
    flag_reason: review.flag_reason,
  })))
})

export const batchModerateProductReviewsWorkflow = createWorkflow(
  "batch-moderate-product-reviews",
  (input: BatchModerateProductReviewsInput) => {
    const result = batchModerateStep(input)
    const statsInput = transform({ result }, ({ result }) => ({
      product_ids: result.product_ids,
    }))
    recalculateProductReviewStatsWorkflow.runAsStep({ input: statsInput })
    invalidateProductReviewCacheWorkflow.runAsStep({ input: statsInput })
    return new WorkflowResponse(result)
  }
)
