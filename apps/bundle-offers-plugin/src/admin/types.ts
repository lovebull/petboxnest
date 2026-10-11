export type AdminBundleComponent = {
  id?: string
  inventory_item_id: string
  required_quantity: number
  role: "paid" | "gift"
  label: string | null
  display_order: number
}

export type AdminBundleOption = {
  id?: string
  variant_id: string
  title: string
  subtitle: string | null
  badge: string | null
  gift_label: string | null
  compare_at_prices: Record<string, number> | null
  display_order: number
  is_default: boolean
  is_active: boolean
  components: AdminBundleComponent[]
}

export type AdminBundleOffer = {
  id: string
  product_id: string
  title: string
  subtitle: string | null
  status: "draft" | "active" | "archived"
  starts_at: string | null
  ends_at: string | null
  updated_at: string
  options: AdminBundleOption[]
}

export type BundleOfferListResponse = {
  bundle_offers: AdminBundleOffer[]
  count: number
  limit: number
  offset: number
}
