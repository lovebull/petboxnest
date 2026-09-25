import { Suspense } from "react"

import { CatalogFilters } from "@lib/util/catalog-filters"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import CatalogPageShell from "./catalog-page-shell"
import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  filters,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <CatalogPageShell
      eyebrow="Shop all"
      title="Find a better fit for every corner of pet life."
      description="Browse PetBoxNest essentials for cozy naps, cleaner routines, and home-friendly pet care."
      currentLabel="All products"
      breadcrumbs={[{ label: "Shop", href: "/store" }, { label: "All products" }]}
      refinement={<RefinementList sortBy={sort} />}
      subnav={[
        { label: "All products" },
        { label: "For cats", href: "/store?pet=cats" },
        { label: "For dogs", href: "/store?pet=dogs" },
      ]}
    >
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            filters={filters}
            emptyTitle="No products matched those filters"
            emptyDescription="Clear a filter or switch pet type to keep exploring PetBoxNest finds."
          />
        </Suspense>
    </CatalogPageShell>
  )
}

export default StoreTemplate
