import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import InteractiveLink from "@modules/common/components/interactive-link"
import { Text } from "@modules/common/components/ui"
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
      order: "created_at",
    },
  })

  if (!products.length) {
    return null
  }

  return (
    <section className="content-container py-12 small:py-24">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <Text className="text-small-semi uppercase tracking-[0.18em] text-ui-fg-muted">
            From the store
          </Text>
          <h2 className="mt-2 text-2xl-regular text-ui-fg-base">
            Latest training gear
          </h2>
        </div>
        <InteractiveLink href="/store">View all</InteractiveLink>
      </div>

      <ul
        className="grid grid-cols-2 gap-x-4 gap-y-10 small:grid-cols-3 small:gap-x-6 small:gap-y-14 medium:grid-cols-4"
        data-testid="home-products-list"
      >
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </section>
  )
}
