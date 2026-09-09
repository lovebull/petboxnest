import type { Metadata } from "next"

type MarketingMetadataInput = {
  countryCode: string
  path?: string
  title: string
  description: string
  image?: string
}

export function createMarketingMetadata({
  countryCode,
  path = "",
  title,
  description,
  image,
}: MarketingMetadataInput): Metadata {
  const normalizedPath = path ? `/${path.replace(/^\/+|\/+$/g, "")}` : ""
  const canonical = `/${countryCode}${normalizedPath}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: "PetBoxNest",
      title,
      description,
      url: canonical,
      images: [image || "/opengraph-image.jpg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || "/twitter-image.jpg"],
    },
  }
}

export function createPrivateMetadata(
  title: string,
  description?: string,
): Metadata {
  return {
    title,
    ...(description ? { description } : {}),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
      },
    },
  }
}
