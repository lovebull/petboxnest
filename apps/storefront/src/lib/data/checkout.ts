"use server"

import { CheckoutResource } from "@lib/types/checkout-resource"
import { revalidateTag } from "next/cache"
import { getCacheTag } from "./cookies"

export async function retryCheckoutResource(resource: CheckoutResource) {
  if (resource === "cart") {
    const cartTag = await getCacheTag("carts")

    revalidateTag("carts")
    if (cartTag) {
      revalidateTag(cartTag)
    }
  }

  if (resource === "payment_providers") {
    revalidateTag("payment_providers")
  }

  if (resource === "shipping_options") {
    revalidateTag("fulfillment")
  }

  return { ok: true as const }
}
