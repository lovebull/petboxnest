"use client"

import RouteErrorState from "@modules/common/components/route-error-state"

export default function MainStoreError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <RouteErrorState {...props} scope="main" />
}
