"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import type { CheckoutResourceResult } from "@lib/types/checkout-resource"
import { reportCheckoutResourceError } from "@lib/util/checkout-error"

export const listCartShippingMethods = async (
  cartId: string,
  countryCode?: string
): Promise<CheckoutResourceResult<HttpTypes.StoreCartShippingOption[]>> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    const { shipping_options } =
      await sdk.client.fetch<HttpTypes.StoreShippingOptionListResponse>(
        `/store/shipping-options`,
        {
          method: "GET",
          query: {
            cart_id: cartId,
          },
          headers,
          cache: "no-store",
        }
      )

    return { ok: true, data: shipping_options }
  } catch (error) {
    return {
      ok: false,
      error: await reportCheckoutResourceError("shipping_options", error, {
        cartId,
        countryCode,
      }),
    }
  }
}

export const calculatePriceForShippingOption = async (
  optionId: string,
  cartId: string,
  data?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  const body = { cart_id: cartId, data }

  if (data) {
    body.data = data
  }

  return sdk.client
    .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
      `/store/shipping-options/${optionId}/calculate`,
      {
        method: "POST",
        body,
        headers,
        next,
      }
    )
    .then(({ shipping_option }) => shipping_option)
    .catch((_e) => {
      return null
    })
}
