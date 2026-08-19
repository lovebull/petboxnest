import { sdk } from "@lib/config"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ countryCode: string; code: string }> }
) {
  const { countryCode, code } = await params
  const normalizedCode = code.trim().toUpperCase()
  const result = await sdk.client
    .fetch<{
      valid: boolean
      referral: { attribution_days: number } | null
    }>(`/store/referrals/${encodeURIComponent(normalizedCode)}`, {
      method: "GET",
      cache: "no-store",
    })
    .catch(() => ({ valid: false, referral: null }))

  const target = new URL(`/${countryCode}`, request.url)
  if (!result.valid || !result.referral) {
    target.searchParams.set("referral", "invalid")
    return NextResponse.redirect(target)
  }

  target.searchParams.set("referral", "accepted")
  const response = NextResponse.redirect(target)
  response.cookies.set("_larumsport_referral", normalizedCode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: result.referral.attribution_days * 24 * 60 * 60,
  })
  return response
}
