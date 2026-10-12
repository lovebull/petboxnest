export type ProcurementSupplierStatus = "active" | "inactive"
export type PurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled"
export type PurchasePaymentStatus =
  | "unpaid"
  | "partially_paid"
  | "paid"
  | "refunded"

export type SupplierInput = {
  id?: string
  code?: string
  name: string
  status?: ProcurementSupplierStatus
  contact_name?: string | null
  email?: string | null
  phone?: string | null
  website_url?: string | null
  supplier_1688_url?: string | null
  supplier_taobao_url?: string | null
  supplier_jd_url?: string | null
  default_currency_code?: string
  payment_terms?: string | null
  notes?: string | null
  admin_user_id?: string | null
}

export type PurchaseOrderItemInput = {
  product_id?: string | null
  variant_id?: string | null
  sku?: string | null
  product_title: string
  variant_title?: string | null
  supplier_sku?: string | null
  supplier_url?: string | null
  quantity: number
  unit_cost: number
  notes?: string | null
}

export type PurchaseOrderInput = {
  id?: string
  order_number?: string
  supplier_id: string
  currency_code: string
  base_currency_code?: string
  exchange_rate?: number
  shipping_amount?: number
  tax_amount?: number
  discount_amount?: number
  other_amount?: number
  ordered_at?: string | null
  expected_at?: string | null
  notes?: string | null
  items: PurchaseOrderItemInput[]
  admin_user_id?: string | null
}

export type RecordPaymentInput = {
  order_id: string
  amount: number
  currency_code: string
  payment_method?: string | null
  transaction_reference?: string | null
  paid_at?: string | null
  notes?: string | null
  admin_user_id?: string | null
}

export type ReceiptItemInput = {
  order_item_id: string
  quantity: number
  notes?: string | null
}

export type RecordReceiptInput = {
  order_id: string
  receipt_number?: string
  warehouse_name?: string | null
  received_at?: string | null
  notes?: string | null
  items: ReceiptItemInput[]
  admin_user_id?: string | null
}
