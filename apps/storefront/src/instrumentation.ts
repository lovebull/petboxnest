import type { Instrumentation } from "next"

export async function register() {}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const digest =
    error instanceof Error &&
    "digest" in error &&
    typeof error.digest === "string"
      ? error.digest
      : undefined

  console.error(
    "[storefront-server-error]",
    JSON.stringify({
      event: "next_request_failed",
      digest,
      route_path: context.routePath,
      route_type: context.routeType,
      render_source: context.renderSource,
      method: request.method,
    }),
  )
}
