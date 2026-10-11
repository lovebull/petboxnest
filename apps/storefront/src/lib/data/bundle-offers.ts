"use server"

import { sdk } from "@lib/config"

export type StoreBundleOfferComponent = {
  required_quantity: number
  role: "paid" | "gift"
  label: string | null
  display_order: number
}

export type StoreBundleOfferOption = {
  id: string
  variant_id: string
  title: string
  subtitle: string | null
  badge: string | null
  gift_label: string | null
  compare_at_prices: Record<string, number> | null
  display_order: number
  is_default: boolean
  components: StoreBundleOfferComponent[]
}

export type StoreBundleOffer = {
  id: string
  product_id: string
  title: string
  subtitle: string | null
  options: StoreBundleOfferOption[]
}

export async function getProductBundleOffer(productId: string) {
  return sdk.client
    .fetch<{ bundle_offer: StoreBundleOffer | null }>(
      `/store/products/${productId}/bundle-offer`,
      {
        cache: "no-store",
      }
    )
    .then((response) => response.bundle_offer)
    .catch(() => null)
}
