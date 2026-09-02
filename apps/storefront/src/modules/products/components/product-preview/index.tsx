import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="pbn-focus group block rounded-[22px]"
    >
      <article data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
          alt={product.title}
          className="!rounded-[22px] !border !border-[#E6E8EC] !bg-mist !p-0 !shadow-none transition-transform duration-200 group-hover:-translate-y-1 group-hover:!shadow-[0_8px_24px_rgba(32,36,51,0.08)] motion-reduce:transition-none"
        />
        <div className="mt-4 flex items-start justify-between gap-3 text-sm">
          <Text
            className="line-clamp-2 font-semibold leading-5 text-ink"
            data-testid="product-title"
          >
            {product.title}
          </Text>
          <div className="flex shrink-0 items-center gap-x-2 font-bold text-ink">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
        {product.subtitle && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">
            {product.subtitle}
          </p>
        )}
      </article>
    </LocalizedClientLink>
  )
}
