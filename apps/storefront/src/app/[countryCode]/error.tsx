"use client"

import RouteErrorState from "@modules/common/components/route-error-state"

export default function CountryError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorState
      {...props}
      scope="country"
      title="We couldn’t prepare this storefront."
      description="Try loading your local store again. If the problem continues, our support team can help."
      backHref="/"
      backLabel="Return home"
    />
  )
}
