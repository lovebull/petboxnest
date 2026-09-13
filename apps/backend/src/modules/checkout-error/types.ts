export type CheckoutErrorResource =
  | "cart"
  | "shipping_options"
  | "payment_providers"
  | "store_credit"
  | "route_render";

export type CheckoutErrorResolutionStatus = "open" | "resolved" | "ignored";
