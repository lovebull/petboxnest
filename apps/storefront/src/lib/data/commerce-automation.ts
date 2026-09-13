"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"

export async function subscribeToRestock(input: {
  variant_id: string
  email: string
  country_code: string
  consent: boolean
}) {
  return sdk.client.fetch<{ subscription: { id: string } }>("/store/restock-subscriptions", {
    method: "POST",
    body: { ...input, consent_source: "product_page" },
    cache: "no-store",
  }).catch(medusaError)
}

export async function consumeCartRecovery(token: string) {
  return sdk.client.fetch<{ cart_id: string; country_code: string }>("/store/cart-recovery/consume", {
    method: "POST",
    body: { token },
    cache: "no-store",
  }).catch(medusaError)
}

export async function unsubscribeCommerceEmail(feature: "restock" | "cart-recovery", token: string) {
  const path = feature === "restock" ? "/store/restock-subscriptions/unsubscribe" : "/store/cart-recovery/unsubscribe"
  return sdk.client.fetch<{ success: boolean }>(path, { method: "POST", body: { token }, cache: "no-store" }).catch(medusaError)
}
