import { notFound } from "next/navigation"
import { Suspense } from "react"

import { CatalogFilters } from "@lib/util/catalog-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import CatalogPageShell from "@modules/store/templates/catalog-page-shell"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
  filters,
  searchQuery,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
  searchQuery?: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const isSearch = Boolean(searchQuery)

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  const breadcrumbs = [
    { label: "Shop", href: "/store" },
    ...parents.reverse().map((parent) => ({
      label: parent.name,
      href: `/categories/${parent.handle}`,
    })),
    { label: category.name },
  ]

  const subnav =
    category.category_children?.map((child) => ({
      label: child.name,
      href: `/categories/${child.handle}`,
    })) || []

  return (
    <CatalogPageShell
      eyebrow={isSearch ? "Category search" : "Category"}
      title={isSearch ? `Search "${searchQuery}" in ${category.name}` : category.name}
      description={
        isSearch
          ? "Search this category by product title, keyword, SKU, and related category details."
          : category.description ||
            "Browse useful, home-friendly picks selected for this part of pet life."
      }
      currentLabel={isSearch ? `Searching "${searchQuery}"` : category.name}
      breadcrumbs={breadcrumbs}
      refinement={
        <RefinementList
          sortBy={sort}
          data-testid="sort-by-container"
          hideOptionsPicker
        />
      }
      subnav={subnav}
    >
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            filters={filters}
            searchQuery={searchQuery}
            emptyTitle={
              isSearch
                ? `No products found for "${searchQuery}"`
                : `No products found in ${category.name}`
            }
            emptyDescription="Clear filters or step back to the full shop to find another cozy fit."
          />
        </Suspense>
    </CatalogPageShell>
  )
}
