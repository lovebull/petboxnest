import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BUNDLE_OFFERS_MODULE } from "../../../../../modules/bundle-offers"
import type BundleOffersModuleService from "../../../../../modules/bundle-offers/service"
import { retrieveBundleOfferDetail } from "../../../../../modules/bundle-offers/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<BundleOffersModuleService>(
    BUNDLE_OFFERS_MODULE
  )
  const offer = await retrieveBundleOfferDetail(service, {
    product_id: req.params.id,
  })
  const now = Date.now()
  const visible =
    offer?.status === "active" &&
    (!offer.starts_at || new Date(offer.starts_at).getTime() <= now) &&
    (!offer.ends_at || new Date(offer.ends_at).getTime() >= now)

  if (!offer || !visible) {
    res.json({ bundle_offer: null })
    return
  }

  res.json({
    bundle_offer: {
      id: offer.id,
      product_id: offer.product_id,
      title: offer.title,
      subtitle: offer.subtitle,
      options: offer.options
        .filter((option) => option.is_active)
        .map((option) => ({
          id: option.id,
          variant_id: option.variant_id,
          title: option.title,
          subtitle: option.subtitle,
          badge: option.badge,
          gift_label: option.gift_label,
          compare_at_prices: option.compare_at_prices,
          display_order: option.display_order,
          is_default: option.is_default,
          components: option.components.map((component) => ({
            required_quantity: component.required_quantity,
            role: component.role,
            label: component.label,
            display_order: component.display_order,
          })),
        })),
    },
  })
}
