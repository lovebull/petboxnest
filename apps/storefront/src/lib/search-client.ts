import {
  createInstantSearchAdapter,
  type MedusaSdkLike,
} from "@medusajs/instantsearch-adapter"

import { sdk } from "@lib/config"

export const PRODUCT_INDEX_NAME = "product"
export const SEARCH_PRICE_CURRENCIES = ["eur", "usd"]

export type PriceField =
  | "min_price"
  | "max_price"
  | "original_price"
  | "on_sale"

export const indexedCurrency = (currencyCode: string) => {
  const code = currencyCode.toLowerCase()

  return SEARCH_PRICE_CURRENCIES.includes(code)
    ? code
    : SEARCH_PRICE_CURRENCIES[0]
}

export const priceAttribute = (field: PriceField, currencyCode: string) =>
  `${field}_${indexedCurrency(currencyCode)}`

export const { searchClient } = createInstantSearchAdapter({
  sdk: sdk as unknown as MedusaSdkLike,
  path: "/store/search",
  placeholderSearch: false,
  additionalSearchParameters: {
    search_options: {
      match_strategy: "last",
    },
  },
  numericAttributes: SEARCH_PRICE_CURRENCIES.flatMap((currency) => [
    `min_price_${currency}`,
    `max_price_${currency}`,
  ]),
})
