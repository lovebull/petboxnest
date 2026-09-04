import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { moderateProductReviewWorkflow } from "../../../../../workflows/product-review/moderate-product-review"

type Body = { status: "pending" | "approved" | "flagged"; reason?: string | null }
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const { result } = await moderateProductReviewWorkflow(req.scope).run({ input: { id: req.params.id, ...req.validatedBody, admin_user_id: req.auth_context.actor_id } })
  res.json({ review: result })
}
