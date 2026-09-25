import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { CatalogFilters } from "@lib/util/catalog-filters"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  optionValueIds,
  filters,
  searchQuery,
  emptyTitle = "No products found",
  emptyDescription = "Try clearing a filter or browse all PetBoxNest finds.",
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
  searchQuery?: string
  emptyTitle?: string
  emptyDescription?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return (
      <CatalogState
        title="We couldn't load this region"
        description="Refresh the page or return to the shop while we reconnect the catalog."
      />
    )
  }

  let products: HttpTypes.StoreProduct[] = []
  let count = 0

  try {
    const result = await listProductsWithSort({
      page,
      queryParams,
      sortBy,
      countryCode,
      optionValueIds,
      filters,
      searchQuery,
    })

    products = result.response.products
    count = result.response.count
  } catch (error) {
    console.error("[catalog-products-load-failed]", error)
    return (
      <CatalogState
        title="Product loading hit a snag"
        description="Refresh to try again, or contact us if the catalog keeps acting shy."
      />
    )
  }

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (!products.length) {
    return (
      <CatalogState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel="Clear filters"
        actionHref="/store"
      />
    )
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-2 xsmall:flex-row xsmall:items-end xsmall:justify-between">
        <p className="text-sm font-semibold text-muted">
          Showing {products.length} of {count} products
        </p>
        {totalPages > 1 && (
          <p className="text-sm font-semibold text-muted">
            Page {page} of {totalPages}
          </p>
        )}
      </div>
      <ul
        className="grid w-full grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-3 small:gap-x-6 medium:grid-cols-4"
        data-testid="products-list"
      >
        {products.map((p) => {
          return (
            <li key={p.id}>
              <ProductPreview product={p} region={region} />
            </li>
          )
        })}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}

function CatalogState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-grey-30 bg-white px-6 py-16 text-center shadow-[0_8px_24px_rgba(32,36,51,0.05)]">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
        Catalog note
      </p>
      <h2 className="mx-auto mt-3 max-w-[520px] font-display text-3xl font-bold leading-tight text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-[560px] text-base leading-7 text-muted">
        {description}
      </p>
      {actionLabel && actionHref && (
        <LocalizedClientLink
          href={actionHref}
          className="pbn-secondary-button mt-7 inline-flex"
        >
          {actionLabel}
        </LocalizedClientLink>
      )}
    </div>
  )
}
