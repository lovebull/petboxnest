import type BundleOffersModuleService from "./service"
import type {
  BundleOfferComponentRecord,
  BundleOfferDetail,
  BundleOfferOptionRecord,
  BundleOfferRecord,
} from "../../types"

export async function retrieveBundleOfferDetail(
  service: BundleOffersModuleService,
  filters: { id?: string; product_id?: string }
): Promise<BundleOfferDetail | null> {
  const [offer] = (await service.listBundleOffers(filters, {
    take: 1,
  })) as BundleOfferRecord[]

  if (!offer) {
    return null
  }

  const options = (await service.listBundleOfferOptions(
    { offer_id: offer.id },
    { order: { display_order: "ASC", created_at: "ASC" } }
  )) as BundleOfferOptionRecord[]
  const optionIds = options.map((option) => option.id)
  const components = optionIds.length
    ? ((await service.listBundleOfferComponents(
        { option_id: optionIds },
        { order: { display_order: "ASC", created_at: "ASC" } }
      )) as BundleOfferComponentRecord[])
    : []

  return {
    ...offer,
    options: options.map((option) => ({
      ...option,
      components: components.filter(
        (component) => component.option_id === option.id
      ),
    })),
  }
}
