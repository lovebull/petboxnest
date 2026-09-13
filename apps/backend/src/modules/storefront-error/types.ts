export type StorefrontErrorScope =
  | "root"
  | "country"
  | "main"
  | "product-detail"
  | "articles"
  | "account"
  | "cart"
  | "checkout"

export type StorefrontErrorResolutionStatus = "open" | "resolved" | "ignored"
