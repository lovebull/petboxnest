import { getHomepageReviews } from "@lib/data/product-reviews"
import ReviewRail, { type PetParentVoice } from "./review-rail"

const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

const PetParentReviews = async () => {
  const data = await getHomepageReviews()

  if (!data.reviews.length) {
    return null
  }

  const voices: PetParentVoice[] = data.reviews.map((review) => ({
    id: review.id,
    name: review.reviewer_name,
    title: review.title || "A note from their home",
    content: review.content,
    rating: review.rating,
    dateLabel: reviewDateFormatter.format(new Date(review.created_at)),
    product: review.product
      ? {
          title: review.product.title,
          handle: review.product.handle,
        }
      : null,
  }))

  return (
    <section
      aria-labelledby="pet-parent-reviews-heading"
      className="bg-mist py-16 text-ink small:py-24"
    >
      <div className="pbn-container">
        <header className="mx-auto max-w-[760px] text-center">
          <p className="text-xs font-bold uppercase tracking-normal text-brand">
            Approved customer reviews
          </p>
          <h2
            id="pet-parent-reviews-heading"
            className="mt-3 font-display text-[34px] font-bold leading-tight tracking-normal small:text-[46px]"
          >
            What pet parents are saying
          </h2>
          <p className="mx-auto mt-4 max-w-[650px] text-base leading-7 text-muted small:text-lg small:leading-8">
            Honest notes from PetBoxNest customer accounts, published after
            moderation.
          </p>
        </header>

        <ReviewRail voices={voices} />
      </div>
    </section>
  )
}

export default PetParentReviews
