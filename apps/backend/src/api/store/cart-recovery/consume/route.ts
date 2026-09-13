import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { consumeCartRecoveryWorkflow } from "../../../../workflows/cart-recovery/consume-cart-recovery"

export async function POST(req: MedusaRequest<{ token: string }>, res: MedusaResponse) {
  const { result } = await consumeCartRecoveryWorkflow(req.scope).run({ input: req.validatedBody })
  res.json(result)
}
