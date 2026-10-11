export type BundleOfferStatus = "draft" | "active" | "archived"
export type BundleComponentRole = "paid" | "gift"

export type BundleOfferComponentInput = {
  inventory_item_id: string
  required_quantity: number
  role: BundleComponentRole
  label?: string | null
  display_order?: number
}

export type BundleOfferOptionInput = {
  variant_id: string
  title: string
  subtitle?: string | null
  badge?: string | null
  gift_label?: string | null
  compare_at_prices?: Record<string, number> | null
  display_order?: number
  is_default?: boolean
  is_active?: boolean
  components: BundleOfferComponentInput[]
}

export type UpsertBundleOfferInput = {
  id?: string
  product_id: string
  title: string
  subtitle?: string | null
  status: BundleOfferStatus
  starts_at?: string | null
  ends_at?: string | null
  updated_by?: string | null
  options: BundleOfferOptionInput[]
}

export type BundleOfferRecord = {
  id: string
  product_id: string
  title: string
  subtitle: string | null
  status: BundleOfferStatus
  starts_at: string | Date | null
  ends_at: string | Date | null
  updated_by: string | null
  created_at: string | Date
  updated_at: string | Date
}

export type BundleOfferOptionRecord = Omit<BundleOfferOptionInput, "components"> & {
  id: string
  offer_id: string
  subtitle: string | null
  badge: string | null
  gift_label: string | null
  compare_at_prices: Record<string, number> | null
  display_order: number
  is_default: boolean
  is_active: boolean
  created_at: string | Date
  updated_at: string | Date
}

export type BundleOfferComponentRecord = BundleOfferComponentInput & {
  id: string
  option_id: string
  label: string | null
  display_order: number
  original_required_quantity: number | null
  link_created_by_offer: boolean
  created_at: string | Date
  updated_at: string | Date
}

export type BundleOfferDetail = BundleOfferRecord & {
  options: Array<BundleOfferOptionRecord & {
    components: BundleOfferComponentRecord[]
  }>
}
