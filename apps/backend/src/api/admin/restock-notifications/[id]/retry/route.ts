import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendRestockNotificationWorkflow } from "../../../../../workflows/restock/send-restock-notification"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await sendRestockNotificationWorkflow(req.scope).run({ input: { subscription_id: req.params.id } })
  res.json(result)
}
