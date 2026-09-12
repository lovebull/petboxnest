import "server-only"

import { createHash, randomUUID } from "node:crypto"

import type {
  CheckoutResource,
  CheckoutResourceError,
} from "@lib/types/checkout-resource"

type MedusaRequestError = {
  status?: number
  statusText?: string
  message?: string
}

type CheckoutErrorContext = {
  cartId?: string
  regionId?: string
  countryCode?: string
}

const userMessages: Record<CheckoutResource, string> = {
  cart: "We couldn't refresh your cart details.",
  shipping_options: "We couldn't load delivery options right now.",
  payment_providers: "Payment options are temporarily unavailable.",
  store_credit: "We couldn't check your store credit balance.",
}

const redactCartId = (cartId?: string) => {
  if (!cartId) {
    return undefined
  }

  return createHash("sha256").update(cartId).digest("hex").slice(0, 12)
}

export function reportCheckoutResourceError(
  resource: CheckoutResource,
  error: unknown,
  context: CheckoutErrorContext = {}
): CheckoutResourceError {
  const requestError = error as MedusaRequestError
  const status =
    typeof requestError?.status === "number" ? requestError.status : undefined
  const retryable =
    status === undefined || status === 408 || status === 429 || status >= 500
  const errorId = `PBN-${randomUUID().slice(0, 8).toUpperCase()}`
  const code = status ? `MEDUSA_${status}` : "MEDUSA_REQUEST_FAILED"

  console.error(
    "[checkout-resource-error]",
    JSON.stringify({
      event: "checkout_dependency_failed",
      error_id: errorId,
      resource,
      code,
      status,
      retryable,
      cart_id_hash: redactCartId(context.cartId),
      region_id: context.regionId,
      country_code: context.countryCode,
      occurred_at: new Date().toISOString(),
    })
  )

  return {
    resource,
    code,
    errorId,
    retryable,
    userMessage: userMessages[resource],
  }
}
