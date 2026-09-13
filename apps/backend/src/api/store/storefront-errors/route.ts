import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { CreateStorefrontErrorInput } from "../../../workflows/storefront-error"
import { createStorefrontErrorWorkflow } from "../../../workflows/storefront-error"

export async function POST(
  req: MedusaRequest<CreateStorefrontErrorInput>,
  res: MedusaResponse,
) {
  const { result } = await createStorefrontErrorWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.status(201).json({ error_id: result.error_id })
}
