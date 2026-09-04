import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

type InvalidateProductReviewCacheInput = { product_ids: string[] }

const invalidateProductReviewCacheStep = createStep(
  "invalidate-product-review-cache",
  async (input: InvalidateProductReviewCacheInput, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const secret = process.env.REVALIDATE_SECRET
    if (!secret) {
      logger.warn("Skipping product-review cache invalidation: REVALIDATE_SECRET is not configured.")
      return new StepResponse({ revalidated: false, reason: "missing_secret" })
    }

    const storefrontUrl =
      process.env.STOREFRONT_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      `${process.env.PUBLIC_PROTOCOL || "http"}://${process.env.PUBLIC_HOST || "127.0.0.1"}:7000`
    try {
      const response = await fetch(
        `${storefrontUrl.replace(/\/$/, "")}/api/revalidate`,
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${secret}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            tags: [
              "product-reviews",
              ...input.product_ids.map((id) => `product-reviews-${id}`),
            ],
          }),
          signal: AbortSignal.timeout(5000),
        }
      )
      if (!response.ok) {
        logger.warn(`Product-review cache invalidation returned ${response.status}.`)
        return new StepResponse({ revalidated: false, reason: `http_${response.status}` })
      }
    } catch (error) {
      logger.warn(
        `Product-review cache invalidation failed without blocking moderation: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
      return new StepResponse({ revalidated: false, reason: "request_failed" })
    }
    return new StepResponse({ revalidated: true })
  }
)

export const invalidateProductReviewCacheWorkflow = createWorkflow(
  "invalidate-product-review-cache",
  (input: InvalidateProductReviewCacheInput) =>
    new WorkflowResponse(invalidateProductReviewCacheStep(input))
)
