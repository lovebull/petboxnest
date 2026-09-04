"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { revalidatePath } from "next/cache"

export type PublicReview = {
  id: string
  rating: number
  title: string | null
  content: string
  reviewer_name: string
  created_at: string
  reply: { content: string; created_at: string } | null
}
export type ProductReviewsResponse = {
  reviews: PublicReview[]
  count: number
  page: number
  page_size: number
  page_count: number
  average_rating: number
  rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>
}

export async function getProductReviews(productId: string, query?: { page?: number; rating?: number; q?: string; sort?: string }) {
  return sdk.client.fetch<ProductReviewsResponse>(`/store/products/${productId}/reviews`, {
    query: { page: query?.page || 1, limit: 10, rating: query?.rating, q: query?.q, sort: query?.sort || "newest" },
    // Moderation changes must be visible immediately. Keep tags so the backend can
    // also invalidate any parent route caches without serving stale review data.
    cache: "no-store",
    next: { tags: ["product-reviews", `product-reviews-${productId}`] },
  }).catch(() => ({ reviews: [], count: 0, page: 1, page_size: 10, page_count: 1, average_rating: 0, rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }))
}

export type ReviewFormState = { success?: boolean; error?: string }
export async function submitProductReview(_state: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const productId = String(formData.get("product_id") || "")
  const path = String(formData.get("path") || "")
  const title = String(formData.get("title") || "").trim()
  try {
    await sdk.client.fetch("/store/customers/me/product-reviews", {
      method: "POST",
      headers: await getAuthHeaders(),
      body: {
        product_id: productId,
        rating: Number(formData.get("rating")),
        title: title || undefined,
        content: String(formData.get("content") || "").trim(),
      },
    })
    if (path) revalidatePath(path)
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to submit your review." }
  }
}
