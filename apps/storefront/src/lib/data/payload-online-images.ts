"use server"

import "server-only"

export type PayloadOnlineImage = {
  id: string | number
  title: string
  image_url: string
  description?: string | null
  alt?: string | null
  createdAt?: string
  updatedAt?: string
}

type PayloadListResponse<T> = {
  docs: T[]
}

const PAYLOAD_SERVER_URL =
  process.env.PAYLOAD_SERVER_URL ||
  "http://127.0.0.1:8020"

const PAYLOAD_REVALIDATE_SECONDS = 3600

function withPayloadUrl(url?: string) {
  if (!url || url.startsWith("http")) {
    return url
  }

  return `${PAYLOAD_SERVER_URL}${url.startsWith("/") ? "" : "/"}${url}`
}

function normalizeOnlineImage(image: PayloadOnlineImage): PayloadOnlineImage {
  return {
    ...image,
    image_url: withPayloadUrl(image.image_url) || image.image_url,
  }
}

export async function getHeroOnlineImages({
  limit = 5,
}: {
  limit?: number
} = {}): Promise<PayloadOnlineImage[]> {
  const query = new URLSearchParams()
  query.set("limit", String(limit))
  query.set("sort", "-updatedAt")

  try {
    const response = await fetch(
      `${PAYLOAD_SERVER_URL}/api/online-images?${query.toString()}`,
      {
        cache: "force-cache",
        next: {
          revalidate: PAYLOAD_REVALIDATE_SECONDS,
          tags: ["payload-online-images"],
        },
      },
    )

    if (!response.ok) {
      return []
    }

    const data =
      (await response.json()) as PayloadListResponse<PayloadOnlineImage>

    return data.docs.map(normalizeOnlineImage)
  } catch {
    return []
  }
}
