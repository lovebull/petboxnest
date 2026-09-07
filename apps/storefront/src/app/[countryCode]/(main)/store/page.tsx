import { parseOptionValueIds } from "@lib/util/product-option-filters"
import { createMarketingMetadata } from "@lib/util/seo-metadata"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"

export async function generateMetadata({ params }: Pick<Params, "params">) {
  return createMarketingMetadata({
    countryCode: (await params).countryCode,
    path: "store",
    title: "Shop Pet Essentials | PetBoxNest",
    description:
      "Explore practical litter solutions, cozy resting spots, and home-friendly essentials for happier cats and dogs.",
  })
}

type StorePageSearchParams = Record<string, string | string[] | undefined> & {
  sortBy?: SortOptions
  page?: string
  optionValueIds?: string | string[]
}

type Params = {
  searchParams: Promise<StorePageSearchParams>
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page } = searchParams
  const optionValueIds = parseOptionValueIds(searchParams)

  return (
    <StoreTemplate
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      optionValueIds={optionValueIds}
    />
  )
}
