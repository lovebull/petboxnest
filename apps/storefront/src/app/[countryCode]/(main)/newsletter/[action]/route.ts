import { NextRequest, NextResponse } from "next/server"
import { processNewsletterLink } from "@lib/data/newsletter-link"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryCode: string; action: string }> }
) {
  const { countryCode, action } = await params
  const country = /^[a-z]{2}$/i.test(countryCode) ? countryCode.toLowerCase() : "us"
  const status = action === "confirm" || action === "unsubscribe"
    ? await processNewsletterLink(action, request.nextUrl.searchParams.get("token"))
    : "invalid"
  const destination = new URL(`/${country}`, request.url)
  destination.searchParams.set("newsletter", status)
  destination.hash = "early-access"
  const response = NextResponse.redirect(destination, 303)
  response.headers.set("Cache-Control", "no-store, max-age=0")
  response.headers.set("Referrer-Policy", "no-referrer")
  response.headers.set("X-Robots-Tag", "noindex, nofollow")
  return response
}
