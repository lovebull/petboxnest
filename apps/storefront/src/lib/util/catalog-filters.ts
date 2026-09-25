import { HttpTypes } from "@medusajs/types"

export const PET_FILTER_QUERY_KEY = "pet"
export const PRICE_FILTER_QUERY_KEY = "price"
export const AVAILABILITY_FILTER_QUERY_KEY = "availability"

export type PetFilter = "cats" | "dogs"
export type PriceFilter = "under_25" | "25_50" | "50_100" | "over_100"
export type AvailabilityFilter = "in_stock"

export type CatalogFilters = {
  pet?: PetFilter
  price?: PriceFilter
  availability?: AvailabilityFilter
}

export const petFilterOptions: { value: PetFilter; label: string }[] = [
  { value: "cats", label: "Cats" },
  { value: "dogs", label: "Dogs" },
]

export const priceFilterOptions: {
  value: PriceFilter
  label: string
  min?: number
  max?: number
}[] = [
  { value: "under_25", label: "Under $25", max: 25 },
  { value: "25_50", label: "$25 - $50", min: 25, max: 50 },
  { value: "50_100", label: "$50 - $100", min: 50, max: 100 },
  { value: "over_100", label: "$100+", min: 100 },
]

export const parseCatalogFilters = (
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): CatalogFilters => {
  const read = (key: string) => {
    if (typeof (searchParams as URLSearchParams).get === "function") {
      return (searchParams as URLSearchParams).get(key) || undefined
    }

    const value = (
      searchParams as Record<string, string | string[] | undefined>
    )[key]

    return Array.isArray(value) ? value[0] : value
  }

  const pet = read(PET_FILTER_QUERY_KEY)
  const price = read(PRICE_FILTER_QUERY_KEY)
  const availability = read(AVAILABILITY_FILTER_QUERY_KEY)

  return {
    pet: pet === "cats" || pet === "dogs" ? pet : undefined,
    price: priceFilterOptions.some((option) => option.value === price)
      ? (price as PriceFilter)
      : undefined,
    availability: availability === "in_stock" ? "in_stock" : undefined,
  }
}

export const getProductMinPrice = (product: HttpTypes.StoreProduct) => {
  const prices =
    product.variants
      ?.map((variant) => variant.calculated_price?.calculated_amount)
      .filter((amount): amount is number => typeof amount === "number") || []

  return prices.length ? Math.min(...prices) : null
}

export const isProductInStock = (product: HttpTypes.StoreProduct) =>
  product.variants?.some((variant) => {
    if (!variant.manage_inventory || variant.allow_backorder) {
      return true
    }

    return (variant.inventory_quantity || 0) > 0
  }) || false

const productText = (product: HttpTypes.StoreProduct) =>
  [
    product.title,
    product.subtitle,
    product.description,
    product.handle,
    product.collection?.title,
    product.collection?.handle,
    product.type?.value,
    ...(product.tags?.flatMap((tag) => [tag.value, tag.metadata?.label]) || []),
    ...Object.values(product.metadata || {}).map((value) =>
      typeof value === "string" ? value : ""
    ),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

export const productMatchesPet = (
  product: HttpTypes.StoreProduct,
  pet?: PetFilter
) => {
  if (!pet) {
    return true
  }

  const text = productText(product)

  return pet === "cats"
    ? /\b(cat|cats|kitty|kitten|feline|litter)\b/.test(text)
    : /\b(dog|dogs|puppy|canine)\b/.test(text)
}

export const filterCatalogProducts = (
  products: HttpTypes.StoreProduct[],
  filters?: CatalogFilters
) =>
  products.filter((product) => {
    if (filters?.availability === "in_stock" && !isProductInStock(product)) {
      return false
    }

    if (!productMatchesPet(product, filters?.pet)) {
      return false
    }

    if (filters?.price) {
      const range = priceFilterOptions.find(
        (option) => option.value === filters.price
      )
      const minPrice = getProductMinPrice(product)

      if (minPrice === null || !range) {
        return false
      }

      if (range.min !== undefined && minPrice < range.min) {
        return false
      }

      if (range.max !== undefined && minPrice >= range.max) {
        return false
      }
    }

    return true
  })
