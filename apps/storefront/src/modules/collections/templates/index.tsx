import { Suspense } from "react"

import { CatalogFilters } from "@lib/util/catalog-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CatalogPageShell from "@modules/store/templates/catalog-page-shell"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
  filters,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <CatalogPageShell
      eyebrow="Collection"
      title={collection.title}
      description={`${collection.title} picks from PetBoxNest, gathered for easy browsing and calmer pet routines.`}
      currentLabel={collection.title}
      breadcrumbs={[
        { label: "Shop", href: "/store" },
        { label: "Collections" },
        { label: collection.title },
      ]}
      refinement={<RefinementList sortBy={sort} hideOptionsPicker />}
      subnav={[
        { label: collection.title },
        { label: "All products", href: "/store" },
      ]}
    >
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={collection.products?.length}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            collectionId={collection.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            filters={filters}
            emptyTitle={`No products found in ${collection.title}`}
            emptyDescription="Clear filters or browse all products to find another PetBoxNest match."
          />
        </Suspense>
    </CatalogPageShell>
  )
}
