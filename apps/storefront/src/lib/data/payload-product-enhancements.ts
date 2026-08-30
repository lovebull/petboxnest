"use server"

import "server-only"

import { getPayloadServerUrl } from "@lib/util/public-url"

export type PayloadMedia = {
  alt?: string
  height?: number
  url?: string
  width?: number
}

export type PayloadRichTextNode = {
  children?: PayloadRichTextNode[]
  direction?: "ltr" | "rtl" | null
  fields?: {
    alt?: string
    [key: string]: unknown
  } | null
  format?: string | number
  indent?: number
  listType?: "bullet" | "number" | "check"
  relationTo?: string
  tag?: string
  text?: string
  type?: string
  url?: string
  value?: string | number | PayloadMedia | null
  version?: number
  [key: string]: unknown
}

export type PayloadRichText = {
  root?: PayloadRichTextNode
}

export type ProductEnhancement = {
  id: string
  medusa_product_id?: string
  medusa_product_handle: string
  title: string
  subtitle?: string
  content?: PayloadRichText | null
  hero_eyebrow?: string
  highlights?: {
    label: string
    description?: string
  }[]
  story_sections?: {
    heading: string
    body: string
    image?: PayloadMedia
    image_position?: "left" | "right"
  }[]
  specifications?: {
    label: string
    value: string
  }[]
  care_notes?: string
  video_url?: string
  image_blocks?: {
    image?: PayloadMedia
    title?: string
    description?: string
  }[]
  seo?: {
    meta_title?: string
    meta_description?: string
    og_image?: PayloadMedia
  }
}

type PayloadListResponse<T> = {
  docs: T[]
}

const PAYLOAD_SERVER_URL = getPayloadServerUrl()

const PAYLOAD_REVALIDATE_SECONDS = 3600

function normalizeMediaUrl(url?: string) {
  if (!url) {
    return url
  }

  const embeddedAbsoluteUrl = url.match(/https?:\/\/.+$/)

  if (embeddedAbsoluteUrl && embeddedAbsoluteUrl.index !== 0) {
    return embeddedAbsoluteUrl[0]
  }

  return url
}

function withPayloadUrl(media?: PayloadMedia) {
  const url = normalizeMediaUrl(media?.url)

  if (!media || !url) {
    return media
  }

  if (url.startsWith("http")) {
    return {
      ...media,
      url,
    }
  }

  return {
    ...media,
    url: `${PAYLOAD_SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`,
  }
}

function normalizeRichTextNode(node: PayloadRichTextNode): PayloadRichTextNode {
  const value =
    node.type === "upload" && typeof node.value === "object" && node.value
      ? withPayloadUrl(node.value as PayloadMedia)
      : node.value

  return {
    ...node,
    value,
    children: node.children?.map(normalizeRichTextNode),
  }
}

function normalizeEnhancement(
  enhancement: ProductEnhancement
): ProductEnhancement {
  return {
    ...enhancement,
    content: enhancement.content?.root
      ? {
          ...enhancement.content,
          root: normalizeRichTextNode(enhancement.content.root),
        }
      : enhancement.content,
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
    image_blocks: enhancement.image_blocks?.map((block) => ({
      ...block,
      image: withPayloadUrl(block.image),
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
