import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { CHECKOUT_ERROR_MODULE } from "../../../../../modules/checkout-error"
import type CheckoutErrorModuleService from "../../../../../modules/checkout-error/service"
import { STOREFRONT_ERROR_MODULE } from "../../../../../modules/storefront-error"
import type StorefrontErrorModuleService from "../../../../../modules/storefront-error/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  if (req.params.kind === "checkout") {
    const record = await req.scope.resolve<CheckoutErrorModuleService>(CHECKOUT_ERROR_MODULE).retrieveCheckoutError(req.params.id)
    return res.json({ error: { ...record, kind: "checkout" } })
  }
  if (req.params.kind === "route") {
    const record = await req.scope.resolve<StorefrontErrorModuleService>(STOREFRONT_ERROR_MODULE).retrieveStorefrontError(req.params.id)
    return res.json({ error: { ...record, kind: "route", resource: "route_render" } })
  }
  throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unknown storefront error kind")
}
