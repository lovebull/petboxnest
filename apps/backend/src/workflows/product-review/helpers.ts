import { MedusaError } from "@medusajs/framework/utils"
import type ProductReviewModuleService from "../../modules/product-review/service"
import type { ProductReviewRecord } from "../../modules/product-review/types"

export async function getReviewOrThrow(service: ProductReviewModuleService, id: string) {
  return service.retrieveProductReview(id).catch(() => {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product review not found")
  }) as unknown as Promise<ProductReviewRecord>
}

export async function recalculateStats(service: ProductReviewModuleService, productId: string) {
  const [reviews] = await service.listAndCountProductReviews(
    { product_id: productId, status: "approved" as never },
    { take: 10000 }
  )
  const counts = [0, 0, 0, 0, 0]
  let total = 0
  for (const review of reviews) {
    const rating = Number(review.rating)
    if (rating >= 1 && rating <= 5) {
      counts[rating - 1] += 1
      total += rating
    }
  }
  const [existing] = await service.listProductReviewStats({ product_id: productId })
  const data = {
    product_id: productId,
    average_rating: reviews.length ? Number((total / reviews.length).toFixed(2)) : 0,
    review_count: reviews.length,
    rating_count_1: counts[0],
    rating_count_2: counts[1],
    rating_count_3: counts[2],
    rating_count_4: counts[3],
    rating_count_5: counts[4],
  }
  return existing
    ? service.updateProductReviewStats({ id: existing.id, ...data })
    : service.createProductReviewStats(data)
}
