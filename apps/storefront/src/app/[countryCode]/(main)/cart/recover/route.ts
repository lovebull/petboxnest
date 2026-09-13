import { consumeCartRecovery } from "@lib/data/commerce-automation"
import { setCartId } from "@lib/data/cookies"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const token = request.nextUrl.searchParams.get("token")
  const cartUrl = new URL(`/${countryCode}/cart`, request.url)
  if (!token) {
    cartUrl.searchParams.set("recovery", "invalid")
    return NextResponse.redirect(cartUrl)
  }
  try {
    const result = await consumeCartRecovery(token)
    await setCartId(result.cart_id)
    cartUrl.searchParams.set("recovery", "success")
  } catch {
    cartUrl.searchParams.set("recovery", "invalid")
  }
  const response = NextResponse.redirect(cartUrl)
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}
