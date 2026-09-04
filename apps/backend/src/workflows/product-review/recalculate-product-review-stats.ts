import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PRODUCT_REVIEW_MODULE } from "../../modules/product-review"
import type ProductReviewModuleService from "../../modules/product-review/service"
import { recalculateStats } from "./helpers"

export type RecalculateProductReviewStatsInput = {
  product_ids: string[]
}

type PreviousStat = Record<string, unknown> | null

const recalculateProductReviewStatsStep = createStep(
  "recalculate-product-review-stats",
  async (input: RecalculateProductReviewStatsInput, { container }) => {
    const service = container.resolve<ProductReviewModuleService>(
      PRODUCT_REVIEW_MODULE
    )
    const productIds = [...new Set(input.product_ids)]
    const previous: PreviousStat[] = []
    const stats = []

    for (const productId of productIds) {
      const [existing] = await service.listProductReviewStats({
        product_id: productId,
      })
      previous.push(existing ? ({ ...existing } as Record<string, unknown>) : null)
      stats.push(await recalculateStats(service, productId))
    }

    return new StepResponse(stats, { productIds, previous })
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<ProductReviewModuleService>(
      PRODUCT_REVIEW_MODULE
    )

    for (let index = 0; index < compensation.productIds.length; index++) {
      const productId = compensation.productIds[index]
      const previous = compensation.previous[index]
      const [current] = await service.listProductReviewStats({
        product_id: productId,
      })

      if (previous && current) {
        await service.updateProductReviewStats({
          ...(previous as never),
          id: current.id,
        })
      } else if (!previous && current) {
        await service.deleteProductReviewStats(current.id)
      }
    }
  }
)

export const recalculateProductReviewStatsWorkflow = createWorkflow(
  "recalculate-product-review-stats",
  (input: RecalculateProductReviewStatsInput) =>
    new WorkflowResponse(recalculateProductReviewStatsStep(input))
)
