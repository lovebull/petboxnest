import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { RecordPurchasePaymentBody } from "../../../../../validators"
import { recordPurchasePaymentWorkflow } from "../../../../../../workflows"

export async function POST(
  req: AuthenticatedMedusaRequest<RecordPurchasePaymentBody>,
  res: MedusaResponse
) {
  const { result } = await recordPurchasePaymentWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      ...req.validatedBody,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.status(201).json(result)
}
