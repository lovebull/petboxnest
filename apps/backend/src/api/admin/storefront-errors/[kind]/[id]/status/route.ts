import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import type { CheckoutErrorResolutionStatus } from "../../../../../../modules/checkout-error/types"
import { updateCheckoutErrorWorkflow } from "../../../../../../workflows/checkout-error"
import { updateStorefrontErrorWorkflow } from "../../../../../../workflows/storefront-error"

type Body = { resolution_status: CheckoutErrorResolutionStatus; admin_note?: string | null }

export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const input = {
    id: req.params.id,
    ...req.validatedBody,
    admin_user_id: req.auth_context.actor_id,
  }
  if (req.params.kind === "checkout") {
    const { result } = await updateCheckoutErrorWorkflow(req.scope).run({ input })
    return res.json({ error: { ...result, kind: "checkout" } })
  }
  if (req.params.kind === "route") {
    const { result } = await updateStorefrontErrorWorkflow(req.scope).run({ input })
    return res.json({ error: { ...result, kind: "route", resource: "route_render" } })
  }
  throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unknown storefront error kind")
}
