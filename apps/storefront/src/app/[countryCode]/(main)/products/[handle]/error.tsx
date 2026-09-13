"use client"

import RouteErrorState from "@modules/common/components/route-error-state"

export default function ProductError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorState
      {...props}
      scope="product-detail"
      eyebrow="This product page took a wrong turn"
      title="We couldn’t load this product."
      description="Try again to refresh its price and availability, or browse the rest of the shop."
      backHref="/store"
      backLabel="Browse all products"
    />
  )
}
