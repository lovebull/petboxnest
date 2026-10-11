import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle } from "@lib/data/collections"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { parseCatalogFilters, parseSearchQuery } from "@lib/util/catalog-filters"
import { createMarketingMetadata } from "@lib/util/seo-metadata"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<
    Record<string, string | string[] | undefined> & {
      page?: string
      sortBy?: SortOptions
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
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  return createMarketingMetadata({
    countryCode: params.countryCode,
    path: `collections/${params.handle}`,
    title: `${collection.title} | PetBoxNest`,
    description: `${collection.title} collection from PetBoxNest.`,
  })
}

export default async function CollectionPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)
  const filters = parseCatalogFilters(searchParams)
  const searchQuery = parseSearchQuery(searchParams)

  const collection = await getCollectionByHandle(params.handle).then(
    (collection) => collection,
  )

  if (!collection) {
    notFound()
  }

  return (
    <CollectionTemplate
      collection={collection}
      page={page}
      sortBy={sortBy}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
      filters={filters}
      searchQuery={searchQuery}
    />
  )
}
