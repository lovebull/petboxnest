import "server-only"

import { getPayloadServerUrl } from "@lib/util/public-url"

export type NewsletterLinkAction = "confirm" | "unsubscribe"
export type NewsletterLinkResult = "confirmed" | "unsubscribed" | "invalid" | "error"

export async function processNewsletterLink(
  action: NewsletterLinkAction,
  token: string | null
): Promise<NewsletterLinkResult> {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return "invalid"

  try {
    const endpoint = new URL(`/api/newsletter-subscribers/${action}`, getPayloadServerUrl())
    endpoint.searchParams.set("token", token)
    endpoint.searchParams.set("response", "json")
    // This is a Payload endpoint, not a Medusa Store API request.
    const response = await fetch(endpoint, {
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "application/json" },
    })
    if (!response.ok) return "error"
    const result = await response.json() as { status?: unknown }
    if (result.status === "invalid") return "invalid"
    const expected = action === "confirm" ? "confirmed" : "unsubscribed"
    return result.status === expected ? expected : "error"
  } catch {
    // Never include private CMS URLs, tokens or upstream errors in the response.
    return "error"
  }
}
