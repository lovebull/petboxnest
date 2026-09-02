import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { ArrowRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function LatestProducts({
  countryCode,
  region,
}: {
  countryCode: string
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 8,
    },
  })

  if (!products.length) {
    return null
  }

  return (
    <section
      id="best-sellers"
      className="scroll-mt-28 bg-white py-16 small:py-24"
    >
      <div className="pbn-container">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              A good place to start
            </p>
            <h2 className="mt-3 font-display text-[34px] font-bold leading-tight tracking-[-0.035em] text-ink small:text-[48px]">
              Best sellers
            </h2>
            <p className="mt-3 max-w-[600px] text-base leading-7 text-muted">
              Everyday favorites for cleaner corners, cozier naps, and happier
              homes.
            </p>
          </div>
          <LocalizedClientLink
            href="/store"
            className="pbn-focus hidden min-h-11 items-center gap-2 rounded-lg font-bold text-brand hover:text-brand-dark xsmall:inline-flex"
          >
            Shop all <ArrowRight aria-hidden="true" />
          </LocalizedClientLink>
        </div>

        <ul
          className="grid grid-cols-2 gap-x-4 gap-y-9 small:grid-cols-4 small:gap-x-6"
          data-testid="home-products-list"
        >
          {products.slice(0, 4).map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
        </ul>
        <LocalizedClientLink
          href="/store"
          className="pbn-secondary-button mt-8 w-full xsmall:hidden"
        >
          Shop all products
        </LocalizedClientLink>
      </div>
    </section>
  )
}
