import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { batchModerateProductReviewsWorkflow } from "../../../../workflows/product-review/moderate-product-review"

type Body = { ids: string[]; status: "pending" | "approved" | "flagged"; reason?: string | null }
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const { result } = await batchModerateProductReviewsWorkflow(req.scope).run({ input: { ...req.validatedBody, admin_user_id: req.auth_context.actor_id } })
  res.json({
    batch_id: result.batch_id,
    success_count: result.success_count,
    failure_count: result.failure_count,
    reviews: result.reviews,
  })
}
