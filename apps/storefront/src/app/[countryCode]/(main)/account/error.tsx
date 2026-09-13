"use client"

import RouteErrorState from "@modules/common/components/route-error-state"

export default function AccountError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorState
      {...props}
      scope="account"
      eyebrow="Your account hit a small snag"
      title="We couldn’t load your account."
      description="Your orders and account details have not been changed. Try again or return to the account overview."
      backHref="/account"
      backLabel="Account overview"
    />
  )
}
