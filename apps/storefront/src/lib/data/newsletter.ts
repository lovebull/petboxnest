"use server"

import { headers } from "next/headers"
import { getPayloadServerUrl } from "@lib/util/public-url"

export type NewsletterState = {
  status: "idle" | "success" | "already_subscribed" | "error"
  message: string
}

export async function subscribeToNewsletter(
  _state: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const consent = formData.get("consent") === "on"
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return { status: "error", message: "Please enter a valid email address." }
  if (!consent) return { status: "error", message: "Please accept the privacy notice." }

  try {
    const incoming = await headers()
    const forwardedFor = incoming.get("x-forwarded-for") || incoming.get("x-real-ip") || "unknown"
    const response = await fetch(`${getPayloadServerUrl()}/api/newsletter-subscribers/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": forwardedFor },
      body: JSON.stringify({ email, consent, source: "storefront-homepage" }),
      cache: "no-store",
    })
    const result = await response.json().catch(() => ({})) as { status?: string; message?: string }
    if (!response.ok) return { status: "error", message: result.message || "Subscription failed. Please try again." }
    if (result.status === "already_subscribed") return { status: "already_subscribed", message: "You're already subscribed to PetBoxNest updates." }
    return { status: "success", message: "Check your inbox and confirm your subscription." }
  } catch {
    return { status: "error", message: "We couldn't connect to the subscription service. Please try again." }
  }
}
