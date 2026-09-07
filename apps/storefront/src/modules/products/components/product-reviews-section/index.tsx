import { getProductReviews } from "@lib/data/product-reviews"
import ProductReviews from "@modules/products/components/product-reviews"

export type ProductReviewQuery = {
  page?: number
  rating?: number
  q?: string
  sort?: string
}

export default async function ProductReviewsSection({
  productId,
  productSchemaId,
  query,
}: {
  productId: string
  productSchemaId: string
  query: ProductReviewQuery
}) {
  const reviews = await getProductReviews(productId, query)

  const reviewSchema =
    reviews.count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": productSchemaId,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.average_rating,
            reviewCount: reviews.count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : null

  return (
    <>
      {reviewSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(reviewSchema).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <ProductReviews
        productId={productId}
        data={reviews}
      />
    </>
  )
}

export function ProductReviewsFallback() {
  return (
    <section
      className="border-t border-grey-20 bg-paper py-14 small:py-20"
      aria-label="Loading product reviews"
    >
      <div className="pbn-container animate-pulse">
        <div className="h-4 w-48 rounded-full bg-grey-20" />
        <div className="mt-4 h-10 max-w-sm rounded-xl bg-grey-20" />
        <div className="mt-10 grid gap-6 large:grid-cols-[340px_minmax(0,1fr)]">
          <div className="h-72 rounded-[28px] bg-cream" />
          <div className="h-72 rounded-[28px] bg-mist" />
        </div>
      </div>
    </section>
  )
}
