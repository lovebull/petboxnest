import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ProductChangedEvent = {
  id: string
}

const PRODUCT_CACHE_TAGS = ["products", "categories", "collections"]
const PRODUCT_CACHE_PATHS = ["/us", "/us/store", "/us/categories"]

const getStorefrontRevalidateUrl = () => {
  const explicitUrl = process.env.STOREFRONT_REVALIDATE_URL

  if (explicitUrl) {
    return explicitUrl
  }

  const storefrontUrl =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://127.0.0.1:7000"

  return `${storefrontUrl.replace(/\/$/, "")}/api/revalidate`
}

export default async function productStorefrontCacheHandler({
  event: { data, name: eventName },
  container,
}: SubscriberArgs<ProductChangedEvent>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    logger.warn(
      `Skipping storefront product cache invalidation after ${eventName}: REVALIDATE_SECRET is not configured.`
    )
    return
  }

  try {
    const response = await fetch(getStorefrontRevalidateUrl(), {
      method: "POST",
      headers: {
        authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tags: PRODUCT_CACHE_TAGS,
        paths: PRODUCT_CACHE_PATHS,
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      logger.warn(
        `Storefront product cache invalidation returned ${response.status} after ${eventName} for product ${data.id}.`
      )
      return
    }

    logger.info(
      `Storefront product cache invalidated after ${eventName} for product ${data.id}.`
    )
  } catch (error) {
    logger.warn(
      `Storefront product cache invalidation failed after ${eventName} for product ${data.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}
