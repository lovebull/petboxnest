import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { CHECKOUT_ERROR_MODULE } from "../../../../modules/checkout-error"
import type CheckoutErrorModuleService from "../../../../modules/checkout-error/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const record = await req.scope
    .resolve<CheckoutErrorModuleService>(CHECKOUT_ERROR_MODULE)
    .retrieveCheckoutError(req.params.id)
  res.json({ error: record })
}
