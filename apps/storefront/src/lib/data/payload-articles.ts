"use server"

import "server-only"

import {
  fetchPayloadJson,
  getPayloadPaginationTimeoutMs,
  getPayloadRequestTimeoutMs,
  PayloadRequestError,
  reportPayloadRequestError,
} from "./payload-fetch"
import { getPayloadServerUrl } from "@lib/util/public-url"

type PayloadMedia = {
  alt?: string
  alt_text?: string
  image_url?: string
  sizes?: {
    thumbnail?: {
      url?: string
    }
  }
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
  author?: string | null
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
  hasNextPage?: boolean
  nextPage?: number | null
}

const PAYLOAD_SERVER_URL = getPayloadServerUrl()

const PAYLOAD_REVALIDATE_SECONDS = 3600
const PAYLOAD_MAX_ARTICLE_PAGES = 100

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
          sizes: article.hero_image.sizes
            ? {
                ...article.hero_image.sizes,
                thumbnail: article.hero_image.sizes.thumbnail
                  ? {
                      ...article.hero_image.sizes.thumbnail,
                      url: withPayloadUrl(
                        article.hero_image.sizes.thumbnail.url
                      ),
                    }
                  : undefined,
              }
            : undefined,
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
  optional = false,
}: {
  limit?: number
  optional?: boolean
} = {}): Promise<PayloadArticle[]> {
  const query = new URLSearchParams()
  query.set("limit", String(limit))
  query.set("depth", "1")
  query.set("sort", "-published_at")
  query.set("where[status][equals]", "published")

  try {
    const data = await fetchPayloadJson<PayloadListResponse<PayloadArticle>>(
      `${PAYLOAD_SERVER_URL}/api/articles?${query.toString()}`,
      {
        resource: "articles",
        cache: "force-cache",
        next: {
          revalidate: PAYLOAD_REVALIDATE_SECONDS,
          tags: ["payload-articles"],
        },
      }
    )

    return data.docs.map(normalizeArticle)
  } catch (error) {
    if (optional) {
      console.error("[payload-articles-optional-unavailable]", {
        resource: "article-list",
      })
      return []
    }

    throw error
  }
}

export async function getAllPublishedArticles(): Promise<PayloadArticle[]> {
  const articles: PayloadArticle[] = []
  const startedAt = Date.now()
  const paginationTimeoutMs = getPayloadPaginationTimeoutMs()
  let page = 1

  while (page <= PAYLOAD_MAX_ARTICLE_PAGES) {
    const query = new URLSearchParams()
    query.set("limit", "100")
    query.set("page", String(page))
    query.set("depth", "1")
    query.set("sort", "-published_at")
    query.set("where[status][equals]", "published")

    const remainingTime = paginationTimeoutMs - (Date.now() - startedAt)

    if (remainingTime <= 0) {
      const error = new PayloadRequestError({
        kind: "timeout",
        resource: "articles",
        timeoutMs: paginationTimeoutMs,
        durationMs: Date.now() - startedAt,
      })
      reportPayloadRequestError(error)
      throw error
    }

    const data = await fetchPayloadJson<PayloadListResponse<PayloadArticle>>(
      `${PAYLOAD_SERVER_URL}/api/articles?${query.toString()}`,
      {
        resource: "articles",
        timeoutMs: Math.min(getPayloadRequestTimeoutMs(), remainingTime),
        cache: "force-cache",
        next: {
          revalidate: PAYLOAD_REVALIDATE_SECONDS,
          tags: ["payload-articles"],
        },
      }
    )

    articles.push(...data.docs.map(normalizeArticle))

    if (!data.hasNextPage || !data.nextPage) {
      return articles
    }

    if (data.nextPage <= page) {
      const error = new PayloadRequestError({
        kind: "invalid_response",
        resource: "articles",
        timeoutMs: paginationTimeoutMs,
        durationMs: Date.now() - startedAt,
      })
      reportPayloadRequestError(error)
      throw error
    }

    page = data.nextPage
  }

  const error = new PayloadRequestError({
    kind: "invalid_response",
    resource: "articles",
    timeoutMs: paginationTimeoutMs,
    durationMs: Date.now() - startedAt,
  })
  reportPayloadRequestError(error)
  throw error
}

export async function getArticleBySlug(
  slug: string
): Promise<PayloadArticle | null> {
  const query = new URLSearchParams()
  query.set("limit", "1")
  query.set("depth", "2")
  query.set("where[status][equals]", "published")
  query.set("where[slug][equals]", slug)

  const data = await fetchPayloadJson<PayloadListResponse<PayloadArticle>>(
    `${PAYLOAD_SERVER_URL}/api/articles?${query.toString()}`,
    {
      resource: "article",
      cache: "force-cache",
      next: {
        revalidate: PAYLOAD_REVALIDATE_SECONDS,
        tags: ["payload-articles", `payload-article-${slug}`],
      },
    }
  )

  const article = data.docs[0]

  return article ? normalizeArticle(article) : null
}
