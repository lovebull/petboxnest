import { sdk } from "@lib/config"

export type StorefrontErrorScope =
  | "root"
  | "country"
  | "main"
  | "product-detail"
  | "articles"
  | "account"
  | "cart"
  | "checkout"

const hashErrorSeed = (seed: string) => {
  let hash = 2166136261

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase()
}

export const createStorefrontErrorId = (
  error: Error & { digest?: string },
  scope: StorefrontErrorScope,
) =>
  `PBN-${hashErrorSeed(
    error.digest || `${scope}:${error.name}:${error.message}`,
  )}`

const getCountryCode = () => {
  if (typeof window === "undefined") {
    return undefined
  }

  const countryCode = window.location.pathname.split("/").filter(Boolean)[0]

  return /^[a-z]{2}$/i.test(countryCode || "")
    ? countryCode.toLowerCase()
    : undefined
}

export async function reportStorefrontRouteError({
  error,
  errorId,
  scope,
}: {
  error: Error & { digest?: string }
  errorId: string
  scope: StorefrontErrorScope
}) {
  const payload = {
    error_id: errorId,
    scope,
    code: "NEXT_ROUTE_RENDER_FAILED",
    retryable: true,
    country_code: getCountryCode(),
    route_key: scope,
    digest: error.digest?.slice(0, 160) || null,
    occurred_at: new Date().toISOString(),
  }

  console.error("[storefront-route-error]", {
    error_id: errorId,
    route_key: scope,
    digest: payload.digest,
    name: error.name,
  })

  try {
    await sdk.client.fetch("/store/storefront-errors", {
      method: "POST",
      body: payload,
      cache: "no-store",
    })
  } catch {
    console.error("[storefront-error-reporting-failed]", {
      error_id: errorId,
    })
  }
}
