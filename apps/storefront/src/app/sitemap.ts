import type { MetadataRoute } from "next"

import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { getLatestArticles } from "@lib/data/payload-articles"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { getBaseURL } from "@lib/util/env"
import type { HttpTypes } from "@medusajs/types"

export const revalidate = 3600

const PUBLIC_PATHS = [
  "",
  "/store",
  "/about-us",
  "/articles",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/refund-policy",
  "/shipping-policy",
  "/terms-of-service",
  "/warranty",
] as const

const toDate = (value?: string | Date | null) =>
  value ? new Date(value) : undefined

async function listAllProducts(countryCode: string) {
  const products: HttpTypes.StoreProduct[] = []
  let page = 1

  while (true) {
    const { response, nextPage } = await listProducts({
      countryCode,
      pageParam: page,
      queryParams: {
        limit: 100,
        fields: "id,handle,updated_at,thumbnail",
      },
    })

    products.push(...response.products)

    if (!nextPage) {
      return products
    }

    page = nextPage
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL().replace(/\/$/, "")
  const regions = await listRegions().catch(() => [])
  const countryCodes = Array.from(
    new Set(
      regions.flatMap((region) =>
        (region.countries ?? [])
          .map((country) => country.iso_2?.toLowerCase())
          .filter((country): country is string => Boolean(country))
      )
    )
  )

  const countries = countryCodes.length ? countryCodes : ["us"]
  const [categories, collections, articles, productsByCountry] =
    await Promise.all([
      listCategories({ limit: 100 }).catch(() => []),
      listCollections({ limit: "100" })
        .then(({ collections }) => collections)
        .catch(() => []),
      getLatestArticles({ limit: 100 }),
      Promise.all(
        countries.map(async (countryCode) => ({
          countryCode,
          products: await listAllProducts(countryCode).catch(() => []),
        }))
      ),
    ])

  const entries: MetadataRoute.Sitemap = []

  for (const countryCode of countries) {
    for (const path of PUBLIC_PATHS) {
      entries.push({
        url: `${baseUrl}/${countryCode}${path}`,
        changeFrequency:
          path === "" || path === "/store" ? "daily" : "monthly",
        priority: path === "" ? 1 : path === "/store" ? 0.9 : 0.6,
      })
    }

    const countryProducts =
      productsByCountry.find((entry) => entry.countryCode === countryCode)
        ?.products ?? []

    for (const product of countryProducts) {
      if (!product.handle) continue

      entries.push({
        url: `${baseUrl}/${countryCode}/products/${encodeURIComponent(
          product.handle
        )}`,
        lastModified: toDate(product.updated_at),
        changeFrequency: "weekly",
        priority: 0.8,
        images: product.thumbnail ? [product.thumbnail] : undefined,
      })
    }

    for (const category of categories) {
      if (!category.handle) continue

      entries.push({
        url: `${baseUrl}/${countryCode}/categories/${encodeURIComponent(
          category.handle
        )}`,
        lastModified: toDate(category.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }

    for (const collection of collections) {
      if (!collection.handle) continue

      entries.push({
        url: `${baseUrl}/${countryCode}/collections/${encodeURIComponent(
          collection.handle
        )}`,
        lastModified: toDate(collection.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }

    for (const article of articles) {
      if (!article.slug) continue

      entries.push({
        url: `${baseUrl}/${countryCode}/articles/${encodeURIComponent(
          article.slug
        )}`,
        lastModified: toDate(
          article.updatedAt || article.published_at || article.createdAt
        ),
        changeFrequency: "monthly",
        priority: 0.6,
        images:
          article.hero_image_url || article.hero_image?.url
            ? [article.hero_image_url || article.hero_image!.url!]
            : undefined,
      })
    }
  }

  return entries
}
