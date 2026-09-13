import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { sendCartRecoveryWorkflow } from "../../../../../workflows/cart-recovery/send-cart-recovery"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await sendCartRecoveryWorkflow(req.scope).run({ input: { recovery_id: req.params.id } })
  res.json(result)
}
