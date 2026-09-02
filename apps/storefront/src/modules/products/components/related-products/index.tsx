import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div>
      <div className="mb-10 flex flex-col small:mb-12 small:flex-row small:items-end small:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
            Keep exploring
          </span>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold leading-tight text-ink xsmall:text-4xl">
            More finds for their favorite corner
          </h2>
        </div>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted small:mt-0 small:text-right">
          Related products selected from the same collection and product tags.
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 small:gap-x-6 medium:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
