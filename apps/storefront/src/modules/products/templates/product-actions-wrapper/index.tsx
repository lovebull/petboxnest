import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"
import { getProductBundleOffer } from "@lib/data/bundle-offers"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, bundleOffer] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
      cache: "force-cache",
      authenticated: true,
    }).then(({ response }) => response.products[0]),
    getProductBundleOffer(id),
  ])

  if (!product) {
    return null
  }

  return (
    <ProductActions
      product={product}
      region={region}
      bundleOffer={bundleOffer}
    />
  )
}
