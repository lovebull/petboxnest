"use server"

import "server-only"

import { getPayloadServerUrl } from "@lib/util/public-url"

type PayloadMedia = {
  alt?: string
  alt_text?: string
  image_url?: string
  url?: string
}

export type PayloadRichTextNode = {
  type?: string
  text?: string
  tag?: string
  url?: string
  value?: PayloadMedia | number | null
  fields?: {
    url?: string
    newTab?: boolean
    linkType?: string
  }
  format?: number | string
  children?: PayloadRichTextNode[]
}

export type PayloadRichText = {
  root?: PayloadRichTextNode
}

export type PayloadArticle = {
  id: string | number
  title: string
  slug: string
  excerpt?: string | null
  hero_image?: PayloadMedia
  hero_image_url?: string | null
  content?: PayloadRichText
  published_at?: string | null
  seo?: {
    meta_title?: string | null
    meta_description?: string | null
    og_image?: PayloadMedia
  }
  createdAt?: string
  updatedAt?: string
}

type PayloadListResponse<T> = {
  docs: T[]
}

const PAYLOAD_SERVER_URL = getPayloadServerUrl()

const PAYLOAD_REVALIDATE_SECONDS = 3600

function withPayloadUrl(url?: string) {
  if (!url || url.startsWith("http")) {
    return url
  }

  return `${PAYLOAD_SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

function normalizeRichTextNode(node: PayloadRichTextNode): PayloadRichTextNode {
  const value =
    typeof node.value === "object" && node.value
      ? {
          ...node.value,
          url: withPayloadUrl(node.value.url),
        }
      : node.value

  return {
    ...node,
    value,
    children: node.children?.map(normalizeRichTextNode),
  }
}

function normalizeArticle(article: PayloadArticle): PayloadArticle {
  return {
    ...article,
    hero_image_url: withPayloadUrl(article.hero_image_url || undefined),
    hero_image: article.hero_image
      ? {
          ...article.hero_image,
          image_url: withPayloadUrl(article.hero_image.image_url),
          url: withPayloadUrl(article.hero_image.url),
        }
      : undefined,
    content: article.content?.root
      ? {
          ...article.content,
          root: normalizeRichTextNode(article.content.root),
        }
      : article.content,
    seo: article.seo
      ? {
          ...article.seo,
          og_image: article.seo.og_image
            ? {
                ...article.seo.og_image,
                url: withPayloadUrl(article.seo.og_image.url),
              }
            : undefined,
        }
      : undefined,
  }
}

export async function getLatestArticles({
  limit = 3,
}: {
  limit?: number
} = {}): Promise<PayloadArticle[]> {
  const query = new URLSearchParams()
  query.set("limit", String(limit))
  query.set("depth", "1")
  query.set("sort", "-published_at")
  query.set("where[status][equals]", "published")

  try {
    const response = await fetch(
      `${PAYLOAD_SERVER_URL}/api/articles?${query.toString()}`,
      {
        cache: "force-cache",
        next: {
          revalidate: PAYLOAD_REVALIDATE_SECONDS,
          tags: ["payload-articles"],
        },
      },
    )

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as PayloadListResponse<PayloadArticle>

    return data.docs.map(normalizeArticle)
  } catch {
    return []
  }
}

export async function getArticleBySlug(
  slug: string,
): Promise<PayloadArticle | null> {
  const query = new URLSearchParams()
  query.set("limit", "1")
  query.set("depth", "2")
  query.set("where[status][equals]", "published")
  query.set("where[slug][equals]", slug)

  try {
    const response = await fetch(
      `${PAYLOAD_SERVER_URL}/api/articles?${query.toString()}`,
      {
        cache: "force-cache",
        next: {
          revalidate: PAYLOAD_REVALIDATE_SECONDS,
          tags: ["payload-articles", `payload-article-${slug}`],
        },
      },
    )

    if (!response.ok) {
      return null
    }

    const data = (await response.json()) as PayloadListResponse<PayloadArticle>
    const article = data.docs[0]

    return article ? normalizeArticle(article) : null
  } catch {
    return null
  }
}
