export type CheckoutErrorResource =
  | "cart"
  | "shipping_options"
  | "payment_providers"
  | "store_credit"

export type CheckoutErrorResolutionStatus = "open" | "resolved" | "ignored"
