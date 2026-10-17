import type {
  ProductReviewsResponse,
  PublicReview,
} from "@lib/data/product-reviews"

export type CuratedReviewQuery = {
  page?: number
}

export const curatedProductReviews: PublicReview[] = [
  {
    id: "curated-review-cleanup",
    reviewer_name: "Editorial summary",
    title: "Cleanup feels much simpler",
    content:
      "A tidy box, quick scooping, and less litter tracked across the floor can make the daily cleanup routine noticeably easier.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-odor",
    reviewer_name: "Editorial summary",
    title: "A fresher room, even with two cats",
    content:
      "Reliable odor control is especially valuable in multi-cat homes, where keeping the room fresh between scoops is a recurring priority.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-delivery",
    reviewer_name: "Editorial summary",
    title: "One less heavy errand",
    content:
      "Doorstep delivery removes a heavy errand, while straightforward setup helps a new litter routine feel convenient from the start.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-low-dust",
    reviewer_name: "Editorial summary",
    title: "Soft texture with very little dust",
    content:
      "A soft texture, low dust during pouring, and clumps that hold together are common priorities for comfortable use and easier scooping.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-senior",
    reviewer_name: "Editorial summary",
    title: "Easier for our senior cat",
    content:
      "Senior cats benefit from enough room to turn comfortably, while an easy-to-maintain setup can reduce work for the people caring for them.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-clumps",
    reviewer_name: "Editorial summary",
    title: "Reliable clumps without the mess",
    content:
      "Firm clumps that do not break apart help remove only what is needed, keeping cleanup faster and reducing unnecessary waste.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-multi-cat",
    reviewer_name: "Editorial summary",
    title: "Works well in a busy cat home",
    content:
      "Busy multi-cat homes often prioritize dependable odor control, simple maintenance, and less mess around the litter area.",
    rating: 0,
    created_at: "",
    reply: null,
  },
  {
    id: "curated-review-convenience",
    reviewer_name: "Editorial summary",
    title: "A practical upgrade to our routine",
    content:
      "Straightforward setup and easy replacement can make the transition from scrubbing an older plastic pan feel like a practical routine upgrade.",
    rating: 0,
    created_at: "",
    reply: null,
  },
]

const PAGE_SIZE = 10

export function getCuratedProductReviews(
  query: CuratedReviewQuery,
): ProductReviewsResponse {
  const page = Math.max(1, query.page || 1)
  const pageCount = Math.max(
    1,
    Math.ceil(curatedProductReviews.length / PAGE_SIZE),
  )
  const reviews = curatedProductReviews.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )

  return {
    reviews,
    count: curatedProductReviews.length,
    page,
    page_size: PAGE_SIZE,
    page_count: pageCount,
    average_rating: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  }
}
