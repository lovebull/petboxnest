export type ReviewStatus = "pending" | "approved" | "flagged"

export type ProductReviewRecord = {
  id: string
  product_id: string
  customer_id: string
  order_id: string | null
  order_line_item_id: string | null
  rating: number
  title: string | null
  content: string
  reviewer_name: string
  status: ReviewStatus
  moderated_by: string | null
  moderated_at: Date | string | null
  flag_reason: string | null
  created_at: Date | string
  updated_at: Date | string
}
