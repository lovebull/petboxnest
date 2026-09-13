"use client"

import RouteErrorState from "@modules/common/components/route-error-state"

export default function CartError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorState
      {...props}
      scope="cart"
      eyebrow="Your cart is still in the nest"
      title="We couldn’t refresh your cart."
      description="Your items should still be saved. Try again before making any changes, or continue shopping."
      backHref="/store"
      backLabel="Continue shopping"
    />
  )
}
