import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import type ProductReviewModuleService from "../../modules/product-review/service"
import { getReviewOrThrow } from "./helpers"

type UpsertReplyInput = { review_id: string; content: string; admin_user_id: string }
const upsertReplyStep = createStep("upsert-reply", async (input: UpsertReplyInput, { container }) => {
  const service = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const review = await getReviewOrThrow(service, input.review_id)
  if (review.status !== "approved") throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Only approved reviews can receive a public reply")
  const [existing] = await service.listProductReviewReplies({ review_id: input.review_id })
  const reply = existing
    ? await service.updateProductReviewReplies({ id: existing.id, content: input.content, updated_by: input.admin_user_id })
    : await service.createProductReviewReplies({ review_id: input.review_id, content: input.content, created_by: input.admin_user_id, updated_by: input.admin_user_id })
  await service.createProductReviewAudits({ review_id: input.review_id, admin_user_id: input.admin_user_id, action: "reply_upserted", previous_status: review.status, new_status: review.status, reason: null, batch_id: null })
  return new StepResponse(reply)
})
export const upsertProductReviewReplyWorkflow = createWorkflow("upsert-product-review-reply", (input: UpsertReplyInput) => new WorkflowResponse(upsertReplyStep(input)))

type DeleteReplyInput = { review_id: string; admin_user_id: string }
const deleteReplyStep = createStep("delete-reply", async (input: DeleteReplyInput, { container }) => {
  const service = container.resolve<ProductReviewModuleService>(PRODUCT_REVIEW_MODULE)
  const review = await getReviewOrThrow(service, input.review_id)
  const [reply] = await service.listProductReviewReplies({ review_id: input.review_id })
  if (!reply) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Merchant reply not found")
  await service.deleteProductReviewReplies(reply.id)
  await service.createProductReviewAudits({ review_id: input.review_id, admin_user_id: input.admin_user_id, action: "reply_deleted", previous_status: review.status, new_status: review.status, reason: null, batch_id: null })
  return new StepResponse({ id: reply.id })
})
export const deleteProductReviewReplyWorkflow = createWorkflow("delete-product-review-reply", (input: DeleteReplyInput) => new WorkflowResponse(deleteReplyStep(input)))
