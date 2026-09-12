import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { CreateCheckoutErrorInput } from "../../../workflows/checkout-error"
import { createCheckoutErrorWorkflow } from "../../../workflows/checkout-error"

export async function POST(
  req: MedusaRequest<CreateCheckoutErrorInput>,
  res: MedusaResponse
) {
  const { result } = await createCheckoutErrorWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ error_id: result.error_id })
}
