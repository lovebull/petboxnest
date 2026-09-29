import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const QUERY_BATCH_SIZE = 500

export type MediaProductReference = {
  id: string
  title: string
  roles: Array<"gallery" | "thumbnail">
}

export type MediaVariantReference = {
  id: string
  title: string
  sku: string | null
  product_id: string | null
  product_title: string | null
  roles: Array<"image" | "thumbnail">
}

export type MediaReferences = {
  products: MediaProductReference[]
  variants: MediaVariantReference[]
  total_count: number
  is_orphan: boolean
}

type ProductImageRecord = {
  url: string
  product?: { id: string; title: string } | null
  variants?: Array<{
    id: string
    title: string
    sku?: string | null
    product_id?: string | null
    product?: { id: string; title: string } | null
  }>
}

type ProductThumbnailRecord = {
  id: string
  title: string
  thumbnail?: string | null
}

type VariantThumbnailRecord = {
  id: string
  title: string
  sku?: string | null
  product_id?: string | null
  thumbnail?: string | null
  product?: { id: string; title: string } | null
}

type QueryResult<T> = {
  data: T[]
  metadata?: { count?: number }
}

function emptyReferences(): MediaReferences {
  return {
    products: [],
    variants: [],
    total_count: 0,
    is_orphan: true,
  }
}

function addProductReference(
  references: MediaReferences,
  product: { id: string; title: string },
  role: "gallery" | "thumbnail"
) {
  const existing = references.products.find((item) => item.id === product.id)

  if (existing) {
    if (!existing.roles.includes(role)) {
      existing.roles.push(role)
    }
    return
  }

  references.products.push({ ...product, roles: [role] })
}

function addVariantReference(
  references: MediaReferences,
  variant: {
    id: string
    title: string
    sku?: string | null
    product_id?: string | null
    product?: { id: string; title: string } | null
  },
  role: "image" | "thumbnail"
) {
  const existing = references.variants.find((item) => item.id === variant.id)

  if (existing) {
    if (!existing.roles.includes(role)) {
      existing.roles.push(role)
    }
    return
  }

  references.variants.push({
    id: variant.id,
    title: variant.title,
    sku: variant.sku || null,
    product_id: variant.product_id || variant.product?.id || null,
    product_title: variant.product?.title || null,
    roles: [role],
  })
}

async function queryAll<T>(
  container: MedusaContainer,
  entity: string,
  fields: string[],
  filters?: Record<string, unknown>
) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const records: T[] = []
  let skip = 0

  while (true) {
    const result = (await query.graph({
      entity,
      fields,
      filters,
      pagination: {
        skip,
        take: QUERY_BATCH_SIZE,
      },
    } as never)) as unknown as QueryResult<T>

    records.push(...result.data)
    const total = result.metadata?.count

    if (
      result.data.length < QUERY_BATCH_SIZE ||
      (typeof total === "number" && records.length >= total)
    ) {
      break
    }

    skip += QUERY_BATCH_SIZE
  }

  return records
}

export async function collectReferencedMediaUrls(container: MedusaContainer) {
  const [images, products, variants] = await Promise.all([
    queryAll<ProductImageRecord>(container, "product_image", ["url"]),
    queryAll<ProductThumbnailRecord>(container, "product", ["thumbnail"]),
    queryAll<VariantThumbnailRecord>(container, "product_variant", [
      "thumbnail",
    ]),
  ])
  const urls = new Set<string>()

  images.forEach((image) => image.url && urls.add(image.url))
  products.forEach(
    (product) => product.thumbnail && urls.add(product.thumbnail)
  )
  variants.forEach(
    (variant) => variant.thumbnail && urls.add(variant.thumbnail)
  )

  return urls
}

export async function getMediaReferencesByUrl(
  container: MedusaContainer,
  urls: string[]
) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))]
  const references = Object.fromEntries(
    uniqueUrls.map((url) => [url, emptyReferences()])
  ) as Record<string, MediaReferences>

  if (!uniqueUrls.length) {
    return references
  }

  const [images, products, variants] = await Promise.all([
    queryAll<ProductImageRecord>(
      container,
      "product_image",
      [
        "url",
        "product.id",
        "product.title",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.product_id",
        "variants.product.id",
        "variants.product.title",
      ],
      { url: uniqueUrls }
    ),
    queryAll<ProductThumbnailRecord>(
      container,
      "product",
      ["id", "title", "thumbnail"],
      { thumbnail: uniqueUrls }
    ),
    queryAll<VariantThumbnailRecord>(
      container,
      "product_variant",
      [
        "id",
        "title",
        "sku",
        "product_id",
        "thumbnail",
        "product.id",
        "product.title",
      ],
      { thumbnail: uniqueUrls }
    ),
  ])

  images.forEach((image) => {
    const target = references[image.url]
    if (!target) return

    if (image.product) {
      addProductReference(target, image.product, "gallery")
    }
    image.variants?.forEach((variant) =>
      addVariantReference(target, variant, "image")
    )
  })

  products.forEach((product) => {
    const target = product.thumbnail
      ? references[product.thumbnail]
      : undefined
    if (target) {
      addProductReference(target, product, "thumbnail")
    }
  })

  variants.forEach((variant) => {
    const target = variant.thumbnail
      ? references[variant.thumbnail]
      : undefined
    if (target) {
      addVariantReference(target, variant, "thumbnail")
    }
  })

  Object.values(references).forEach((reference) => {
    reference.total_count =
      reference.products.length + reference.variants.length
    reference.is_orphan = reference.total_count === 0
  })

  return references
}
