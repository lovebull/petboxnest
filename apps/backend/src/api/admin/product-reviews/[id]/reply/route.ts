import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { deleteProductReviewReplyWorkflow, upsertProductReviewReplyWorkflow } from "../../../../../workflows/product-review/manage-product-review-reply"

type Body = { content: string }
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const { result } = await upsertProductReviewReplyWorkflow(req.scope).run({ input: { review_id: req.params.id, content: req.validatedBody.content, admin_user_id: req.auth_context.actor_id } })
  res.json({ reply: result })
}
export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await deleteProductReviewReplyWorkflow(req.scope).run({ input: { review_id: req.params.id, admin_user_id: req.auth_context.actor_id } })
  res.json({ deleted: true, id: result.id })
}
