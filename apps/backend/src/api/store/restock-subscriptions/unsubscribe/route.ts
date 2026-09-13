import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateAutomationSubscriptionStatusWorkflow } from "../../../../workflows/commerce-automation/update-subscription-status"

export async function POST(req: MedusaRequest<{ token: string }>, res: MedusaResponse) {
  try {
    await updateAutomationSubscriptionStatusWorkflow(req.scope).run({ input: { feature: "restock", token: req.validatedBody.token } })
    res.json({ success: true })
  } catch {
    res.status(404).json({ type: "not_found", message: "Subscription not found" })
  }
}
