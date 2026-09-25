"use server"

import { sdk } from "@lib/config"
import {
  CatalogFilters,
  filterCatalogProducts,
} from "@lib/util/catalog-filters"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
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

const hasCatalogFilters = (filters?: CatalogFilters) =>
  Boolean(filters?.pet || filters?.price || filters?.availability)

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

const listAllProducts = async ({
  queryParams,
  countryCode,
}: {
  queryParams?: ProductListQueryParams
  countryCode: string
}) => {
  const products: HttpTypes.StoreProduct[] = []
  let pageParam = 1
  let totalCount = 0

  while (true) {
    const {
      response: { products: batch, count },
    } = await listProducts({
      pageParam,
      queryParams: {
        ...queryParams,
        limit: PRODUCT_BATCH_LIMIT,
      },
      countryCode,
    })

    totalCount = count
    products.push(...batch)

    if (!batch.length || products.length >= count) {
      break
    }

    pageParam += 1
  }

  return { products, count: totalCount }
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

/**
 * Lists products with API-backed pagination whenever the selected sort/filter
 * can be handled by Medusa. Custom catalog filters and price sorting require a
 * full paginated read because Medusa 2.19's Store Product List endpoint doesn't
 * expose those storefront-specific predicates as database filters.
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
  const queryWithOptionFilters = withOptionFilters(queryParams, optionValueIds)
  const requiresFullCatalogPass =
    sortBy === "price_asc" ||
    sortBy === "price_desc" ||
    hasCatalogFilters(filters) ||
    Boolean(searchQuery)

  if (!requiresFullCatalogPass) {
    return listProducts({
      pageParam,
      queryParams: {
        ...queryWithOptionFilters,
        order:
          sortBy === "created_at" ? "-created_at" : queryWithOptionFilters.order,
        limit,
      },
      countryCode,
    })
  }

  const { products } = await listAllProducts({
    queryParams: queryWithOptionFilters,
    countryCode,
  })

  const filteredProducts = filterCatalogProducts(products, filters, searchQuery)
  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const offset = (pageParam - 1) * limit

  const filteredCount = filteredProducts.length

  const nextPage = filteredCount > offset + limit ? pageParam + 1 : null

  const paginatedProducts = sortedProducts.slice(offset, offset + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
