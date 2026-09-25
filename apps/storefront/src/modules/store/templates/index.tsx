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
  searchQuery,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
  searchQuery?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const isSearch = Boolean(searchQuery)

  return (
    <CatalogPageShell
      eyebrow={isSearch ? "Search" : "Shop all"}
      title={
        isSearch
          ? `Search results for "${searchQuery}"`
          : "Find a better fit for every corner of pet life."
      }
      description={
        isSearch
          ? "Refine your search by pet, price, availability, SKU, category, and product options."
          : "Browse PetBoxNest essentials for cozy naps, cleaner routines, and home-friendly pet care."
      }
      currentLabel={isSearch ? `Searching "${searchQuery}"` : "All products"}
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
            searchQuery={searchQuery}
            emptyTitle={
              isSearch
                ? `No products found for "${searchQuery}"`
                : "No products matched those filters"
            }
            emptyDescription={
              isSearch
                ? "Check the spelling, try a broader product name, SKU, or category, or browse all products."
                : "Clear a filter or switch pet type to keep exploring PetBoxNest finds."
            }
          />
        </Suspense>
    </CatalogPageShell>
  )
}

export default StoreTemplate
