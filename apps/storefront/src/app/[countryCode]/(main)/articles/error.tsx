"use client"

import RouteErrorState from "@modules/common/components/route-error-state"

export default function ArticlesError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteErrorState
      {...props}
      scope="articles"
      eyebrow="The journal paused for a moment"
      title="That story didn’t load."
      description="Try again, or return to The Nest Journal to find another helpful read."
      backHref="/articles"
      backLabel="Back to The Nest Journal"
    />
  )
}
