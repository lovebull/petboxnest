import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { BUNDLE_OFFERS_MODULE } from "../../../../modules/bundle-offers"
import type BundleOffersModuleService from "../../../../modules/bundle-offers/service"
import { retrieveBundleOfferDetail } from "../../../../modules/bundle-offers/utils"
import {
  deleteBundleOfferWorkflow,
  upsertBundleOfferWorkflow,
} from "../../../../workflows"
import type { UpsertBundleOfferBody } from "../../../validators"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BundleOffersModuleService>(
    BUNDLE_OFFERS_MODULE
  )
  const offer = await retrieveBundleOfferDetail(service, { id: req.params.id })
  if (!offer) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Bundle offer not found.")
  }
  res.json({ bundle_offer: offer })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpsertBundleOfferBody>,
  res: MedusaResponse
) {
  const { result } = await upsertBundleOfferWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      id: req.params.id,
      updated_by: req.auth_context?.actor_id || null,
    },
  })
  res.json({ bundle_offer: result })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteBundleOfferWorkflow(req.scope).run({
    input: { id: req.params.id },
  })
  res.json({ id: req.params.id, object: "bundle_offer", deleted: true })
}
