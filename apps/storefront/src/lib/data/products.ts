"use server"

import { sdk } from "@lib/config"
import { CatalogFilters, isProductInStock } from "@lib/util/catalog-filters"
import { OptionValueIds } from "@lib/util/product-option-filters"
import type {
  SearchFilters,
  SearchQuery,
  SearchResult,
} from "@medusajs/instantsearch-adapter"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

const PRODUCT_BATCH_LIMIT = 100

type ProductSearchDocument = {
  id?: string | null
  handle?: string | null
}

type ProductSearchResponse = {
  results: SearchResult<ProductSearchDocument>[]
}

const PRODUCT_INDEX_NAME = "product"

const withOptionFilters = (
  queryParams: ProductListQueryParams | undefined,
  optionValueIds: OptionValueIds | undefined
): ProductListQueryParams => {
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  return {
    ...queryParams,
    ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
  }
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
  cache = "force-cache",
  authenticated = false,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
  cache?: RequestCache
  authenticated?: boolean
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = authenticated ? await getAuthHeaders() : undefined

  const next =
    cache === "no-store"
      ? undefined
      : {
          ...(await getCacheOptions("products")),
        }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+variants.sku,*variants.images,*variants.options,+metadata,+tags,*categories,",
          ...queryParams,
        },
        headers,
        next,
        cache,
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

const asArray = (value: string | string[] | undefined) =>
  !value ? [] : Array.isArray(value) ? value : [value]

const buildSearchFilters = ({
  queryParams,
  optionValueIds,
  filters,
  searchQuery,
  currencyCode,
}: {
  queryParams?: ProductListQueryParams
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
  searchQuery?: string
  currencyCode: string
}): SearchFilters | undefined => {
  const constraints: SearchFilters[] = []
  const productIds = asArray(queryParams?.id)
  const collectionIds = asArray(queryParams?.collection_id)
  const categoryIds = asArray(queryParams?.category_id)

  if (productIds.length) {
    constraints.push({ id: { $in: productIds } })
  }

  if (collectionIds.length) {
    constraints.push({ collection_id: { $in: collectionIds } })
  }

  if (categoryIds.length) {
    constraints.push({ category_ids: { $in: categoryIds } })
  }

  if (optionValueIds?.length) {
    constraints.push(
      ...optionValueIds.map((id) => ({ option_value_ids: { $eq: id } }))
    )
  }

  if (filters?.pet) {
    constraints.push({ pet_types: { $eq: filters.pet } })
  }

  if (filters?.price) {
    const priceField = `min_price_${currencyCode.toLowerCase()}`
    const ranges = {
      under_25: { $lt: 25 },
      "25_50": { $gte: 25, $lt: 50 },
      "50_100": { $gte: 50, $lt: 100 },
      over_100: { $gte: 100 },
    } as const

    constraints.push({ [priceField]: ranges[filters.price] })
  }

  const combined =
    constraints.length === 1
      ? constraints[0]
      : constraints.length > 1
      ? { $and: constraints }
      : undefined

  return searchQuery
    ? { ...(combined || {}), q: searchQuery }
    : combined
}

const searchProductIds = async ({
  skip,
  take,
  sortBy,
  currencyCode,
  queryParams,
  optionValueIds,
  filters,
  searchQuery,
}: {
  skip: number
  take: number
  sortBy: SortOptions
  currencyCode: string
  queryParams?: ProductListQueryParams
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
  searchQuery?: string
}) => {
  const priceField = `min_price_${currencyCode.toLowerCase()}`
  const order =
    sortBy === "price_asc"
      ? { [priceField]: "ASC" as const }
      : sortBy === "price_desc"
      ? { [priceField]: "DESC" as const }
      : { created_at: "DESC" as const }

  const query: SearchQuery = {
    entity: PRODUCT_INDEX_NAME,
    filters: buildSearchFilters({
      queryParams,
      optionValueIds,
      filters,
      searchQuery,
      currencyCode,
    }),
    pagination: { skip, take, order },
    search_options: { match_strategy: "last" },
  }

  const { results } = await sdk.client.fetch<ProductSearchResponse>(
    "/store/search",
    {
      method: "POST",
      body: { queries: [query] },
      cache: "no-store",
    }
  )
  const result = results[0]

  return {
    ids: (result?.hits || []).map((hit) => hit.id),
    count: result?.metadata.count ?? result?.hits.length ?? 0,
  }
}

const listProductsByIds = async ({
  ids,
  countryCode,
}: {
  ids: string[]
  countryCode: string
}) => {
  if (!ids.length) {
    return []
  }

  const products: HttpTypes.StoreProduct[] = []

  for (let offset = 0; offset < ids.length; offset += PRODUCT_BATCH_LIMIT) {
    const batchIds = ids.slice(offset, offset + PRODUCT_BATCH_LIMIT)
    const { response } = await listProducts({
      countryCode,
      cache: "no-store",
      queryParams: {
        id: batchIds,
        limit: batchIds.length,
      },
    })

    products.push(...response.products)
  }

  const position = new Map(ids.map((id, index) => [id, index]))

  return products.sort(
    (left, right) =>
      (position.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (position.get(right.id) ?? Number.MAX_SAFE_INTEGER)
  )
}

/**
 * Uses Medusa Search for query, pet, price, option and sort operations, then
 * hydrates the matching IDs through the Store Product API so the existing
 * PetBoxNest product cards keep receiving complete product data.
 */
export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
  filters,
  searchQuery,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
  filters?: CatalogFilters
  searchQuery?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const pageParam = Math.max(page, 1)
  const requiresSearch =
    sortBy === "price_asc" ||
    sortBy === "price_desc" ||
    Boolean(filters?.pet || filters?.price || filters?.availability) ||
    Boolean(optionValueIds?.length) ||
    Boolean(searchQuery)

  if (!requiresSearch) {
    return listProducts({
      pageParam,
      queryParams: {
        ...withOptionFilters(queryParams, optionValueIds),
        order: "-created_at",
        limit,
      },
      countryCode,
    })
  }

  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
      queryParams,
    }
  }

  const offset = (pageParam - 1) * limit
  const searchArgs = {
    sortBy,
    currencyCode: region.currency_code,
    queryParams,
    optionValueIds,
    filters,
    searchQuery,
  }

  if (!filters?.availability) {
    const result = await searchProductIds({
      ...searchArgs,
      skip: offset,
      take: limit,
    })
    const products = await listProductsByIds({
      ids: result.ids,
      countryCode,
    })

    return {
      response: { products, count: result.count },
      nextPage: result.count > offset + limit ? pageParam + 1 : null,
      queryParams,
    }
  }

  const allIds: string[] = []
  let searchCount = 0

  do {
    const result = await searchProductIds({
      ...searchArgs,
      skip: allIds.length,
      take: PRODUCT_BATCH_LIMIT,
    })
    searchCount = result.count
    allIds.push(...result.ids)

    if (!result.ids.length) {
      break
    }
  } while (allIds.length < searchCount)

  const hydratedProducts = await listProductsByIds({
    ids: allIds,
    countryCode,
  })
  const availableProducts = hydratedProducts.filter(isProductInStock)
  const products = availableProducts.slice(offset, offset + limit)
  const count = availableProducts.length

  return {
    response: {
      products,
      count,
    },
    nextPage: count > offset + limit ? pageParam + 1 : null,
    queryParams,
  }
}
