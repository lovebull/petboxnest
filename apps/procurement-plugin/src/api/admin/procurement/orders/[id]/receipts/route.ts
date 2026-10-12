import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { RecordPurchaseReceiptBody } from "../../../../../validators"
import { recordPurchaseReceiptWorkflow } from "../../../../../../workflows"

export async function POST(
  req: AuthenticatedMedusaRequest<RecordPurchaseReceiptBody>,
  res: MedusaResponse
) {
  const { result } = await recordPurchaseReceiptWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      ...req.validatedBody,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.status(201).json(result)
}
