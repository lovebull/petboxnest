import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle } from "@lib/data/categories"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { parseCatalogFilters, parseSearchQuery } from "@lib/util/catalog-filters"
import { createMarketingMetadata } from "@lib/util/seo-metadata"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      sortBy?: SortOptions
      page?: string
      optionValueIds?: string | string[]
      pet?: string
      price?: string
      availability?: string
      q?: string
    }
  >
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | PetBoxNest"

    const description = productCategory.description ?? `${title} category.`

    return createMarketingMetadata({
      countryCode: params.countryCode,
      path: `categories/${params.category.join("/")}`,
      title,
      description,
    })
  } catch {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)
  const filters = parseCatalogFilters(searchParams)
  const searchQuery = parseSearchQuery(searchParams)

  const productCategory = await getCategoryByHandle(params.category)

  if (!productCategory) {
    notFound()
  }

  return (
    <CategoryTemplate
      category={productCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      filters={filters}
      searchQuery={searchQuery}
    />
  )
}
