"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"
import type { CheckoutResourceResult } from "@lib/types/checkout-resource"
import { reportCheckoutResourceError } from "@lib/util/checkout-error"

export const listCartPaymentMethods = async (
  regionId: string,
  cartId?: string,
  countryCode?: string
): Promise<CheckoutResourceResult<HttpTypes.StorePaymentProvider[]>> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  try {
    const { payment_providers } =
      await sdk.client.fetch<HttpTypes.StorePaymentProviderListResponse>(
        `/store/payment-providers`,
        {
          method: "GET",
          query: { region_id: regionId },
          headers,
          next,
          cache: "force-cache",
        }
      )

    return {
      ok: true,
      data: payment_providers.sort((a, b) => {
        return a.id > b.id ? 1 : -1
      }),
    }
  } catch (error) {
    return {
      ok: false,
      error: reportCheckoutResourceError("payment_providers", error, {
        cartId,
        regionId,
        countryCode,
      }),
    }
  }
}
