import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { CheckoutErrorResolutionStatus } from "../../../../../modules/checkout-error/types"
import { updateCheckoutErrorWorkflow } from "../../../../../workflows/checkout-error"

type Body = {
  resolution_status: CheckoutErrorResolutionStatus
  admin_note?: string | null
}

export async function POST(
  req: AuthenticatedMedusaRequest<Body>,
  res: MedusaResponse
) {
  const { result } = await updateCheckoutErrorWorkflow(req.scope).run({
    input: {
      id: req.params.id,
      ...req.validatedBody,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.json({ error: result })
}
