import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { ChangePurchaseOrderStatusBody } from "../../../../../validators"
import { changePurchaseOrderStatusWorkflow } from "../../../../../../workflows"

export async function POST(
  req: AuthenticatedMedusaRequest<ChangePurchaseOrderStatusBody>,
  res: MedusaResponse
) {
  const { result } = await changePurchaseOrderStatusWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      status: req.validatedBody.status,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.json({ purchase_order: result })
}
