import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateAutomationSubscriptionStatusWorkflow } from "../../../../../workflows/commerce-automation/update-subscription-status"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await updateAutomationSubscriptionStatusWorkflow(req.scope).run({ input: { feature: "cart_recovery", id: req.params.id } })
  res.json(result)
}
