"use server"

import "server-only"

export type PayloadMedia = {
  alt?: string
  url?: string
}

export type ProductEnhancement = {
  id: string
  medusa_product_id?: string
  medusa_product_handle: string
  title: string
  subtitle?: string
  hero_eyebrow?: string
  highlights?: {
    label: string
    description?: string
  }[]
  story_sections?: {
    heading: string
    body: string
    image?: PayloadMedia
  }[]
  specifications?: {
    label: string
    value: string
  }[]
  care_notes?: string
  video_url?: string
  seo?: {
    meta_title?: string
    meta_description?: string
    og_image?: PayloadMedia
  }
}

type PayloadListResponse<T> = {
  docs: T[]
}

const PAYLOAD_SERVER_URL =
  process.env.PAYLOAD_SERVER_URL ||
  process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL ||
  "http://127.0.0.1:8020"

const PAYLOAD_REVALIDATE_SECONDS = 3600

function withPayloadUrl(media?: PayloadMedia) {
  if (!media?.url || media.url.startsWith("http")) {
    return media
  }

  return {
    ...media,
    url: `${PAYLOAD_SERVER_URL}${media.url.startsWith("/") ? "" : "/"}${
      media.url
    }`,
  }
}

function normalizeEnhancement(
  enhancement: ProductEnhancement
): ProductEnhancement {
  return {
    ...enhancement,
    seo: enhancement.seo
      ? {
          ...enhancement.seo,
          og_image: withPayloadUrl(enhancement.seo.og_image),
        }
      : undefined,
    story_sections: enhancement.story_sections?.map((section) => ({
      ...section,
      image: withPayloadUrl(section.image),
    })),
  }
}

export async function getProductEnhancement({
  productHandle,
  productId,
}: {
  productHandle: string
  productId?: string
}): Promise<ProductEnhancement | null> {
  const query = new URLSearchParams()
  query.set("limit", "1")
  query.set("depth", "1")

  if (productId) {
    query.set("where[or][0][medusa_product_id][equals]", productId)
    query.set("where[or][1][medusa_product_handle][equals]", productHandle)
  } else {
    query.set("where[medusa_product_handle][equals]", productHandle)
  }

  try {
    const response = await fetch(
      `${PAYLOAD_SERVER_URL}/api/product-enhancements?${query.toString()}`,
      {
        cache: "force-cache",
        next: {
          revalidate: PAYLOAD_REVALIDATE_SECONDS,
          tags: [
            "payload-product-enhancements",
            `payload-product-enhancement-${productHandle}`,
          ],
        },
      }
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as PayloadListResponse<ProductEnhancement>

    return data.docs[0] ? normalizeEnhancement(data.docs[0]) : null
  } catch {
    return null
  }
}
