import type { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BUNDLE_OFFERS_MODULE } from "../../../modules/bundle-offers"
import type BundleOffersModuleService from "../../../modules/bundle-offers/service"
import { retrieveBundleOfferDetail } from "../../../modules/bundle-offers/utils"
import type { BundleOfferRecord } from "../../../types"
import { upsertBundleOfferWorkflow } from "../../../workflows"
import type { UpsertBundleOfferBody } from "../../validators"

const intQuery = (value: unknown, fallback: number) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BundleOffersModuleService>(
    BUNDLE_OFFERS_MODULE
  )
  const limit = Math.min(intQuery(req.query.limit, 20), 100)
  const offset = intQuery(req.query.offset, 0)
  const filters: Record<string, unknown> = {}
  if (typeof req.query.product_id === "string") {
    filters.product_id = req.query.product_id
  }
  if (typeof req.query.status === "string") {
    filters.status = req.query.status
  }

  const [offers, count] = (await service.listAndCountBundleOffers(filters, {
    take: limit,
    skip: offset,
    order: { updated_at: "DESC" },
  })) as [BundleOfferRecord[], number]
  const detailed = await Promise.all(
    offers.map((offer) => retrieveBundleOfferDetail(service, { id: offer.id }))
  )

  res.json({ bundle_offers: detailed.filter(Boolean), count, limit, offset })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpsertBundleOfferBody>,
  res: MedusaResponse
) {
  const { result } = await upsertBundleOfferWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      updated_by: req.auth_context?.actor_id || null,
    },
  })
  res.status(201).json({ bundle_offer: result })
}
