import type ProductReviewModuleService from "../modules/product-review/service"

export type ReviewListQuery = {
  page: number
  limit: number
  rating?: number
  status?: "pending" | "approved" | "flagged"
  ratings?: number[]
  statuses?: Array<"pending" | "approved" | "flagged">
  product_id?: string
  q?: string
  sort: "newest" | "oldest" | "highest" | "lowest"
  date_from?: string
  date_to?: string
  has_reply?: boolean
}

export async function listReviews(service: ProductReviewModuleService, query: ReviewListQuery, fixed: Record<string, unknown> = {}) {
  const filters: Record<string, unknown> = { ...fixed }
  if (query.ratings?.length) filters.rating = query.ratings
  else if (query.rating) filters.rating = query.rating
  if (query.statuses?.length) filters.status = query.statuses
  else if (query.status) filters.status = query.status
  if (query.product_id) filters.product_id = query.product_id
  if (query.date_from || query.date_to) {
    filters.created_at = {
      ...(query.date_from ? { $gte: new Date(query.date_from) } : {}),
      ...(query.date_to ? { $lte: new Date(query.date_to) } : {}),
    }
  }
  let replyReviewIds: string[] = []
  if (typeof query.has_reply === "boolean") {
    const replies = await service.listProductReviewReplies({}, { take: 10000 })
    replyReviewIds = replies.map((reply) => reply.review_id)
  }
  let searchIds: string[] | undefined
  if (query.q) {
    searchIds = await service.searchProductReviewIds(query.q)
  }
  if (typeof query.has_reply === "boolean") {
    if (searchIds) {
      const replySet = new Set(replyReviewIds)
      searchIds = searchIds.filter((id) => replySet.has(id) === query.has_reply)
    } else {
      filters.id = query.has_reply
        ? (replyReviewIds.length ? replyReviewIds : "__no_matching_review__")
        : { $nin: replyReviewIds }
    }
  }
  if (searchIds) {
    filters.id = searchIds.length ? searchIds : "__no_matching_review__"
  }
  Object.assign(filters, fixed)
  const order = query.sort === "oldest" ? { created_at: "ASC" } : query.sort === "highest" ? { rating: "DESC", created_at: "DESC" } : query.sort === "lowest" ? { rating: "ASC", created_at: "DESC" } : { created_at: "DESC" }
  const [reviews, count] = await service.listAndCountProductReviews(filters as never, {
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    order: order as never,
  })
  const reviewIds = reviews.map((review) => review.id)
  const replies = reviewIds.length ? await service.listProductReviewReplies({ review_id: reviewIds }) : []
  const replyMap = new Map(replies.map((reply) => [reply.review_id, reply]))
  return { reviews, count, replyMap }
}

export function pagination(count: number, page: number, limit: number) {
  return { count, page, page_size: limit, page_count: Math.max(1, Math.ceil(count / limit)) }
}
