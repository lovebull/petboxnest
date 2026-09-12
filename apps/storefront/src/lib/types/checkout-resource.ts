export type CheckoutResource =
  | "cart"
  | "shipping_options"
  | "payment_providers"
  | "store_credit"

export type CheckoutResourceError = {
  resource: CheckoutResource
  code: string
  errorId: string
  retryable: boolean
  userMessage: string
}

export type CheckoutResourceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: CheckoutResourceError }
