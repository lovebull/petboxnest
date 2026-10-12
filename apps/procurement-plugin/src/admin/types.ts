export type Supplier = {
  id: string
  code: string
  name: string
  status: "active" | "inactive"
  contact_name: string | null
  email: string | null
  phone: string | null
  website_url: string | null
  supplier_1688_url: string | null
  supplier_taobao_url: string | null
  supplier_jd_url: string | null
  default_currency_code: string
  payment_terms: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PurchaseItem = {
  id: string
  order_id: string
  product_id: string | null
  variant_id: string | null
  sku: string | null
  product_title: string
  variant_title: string | null
  supplier_sku: string | null
  supplier_url: string | null
  quantity: number
  received_quantity: number
  unit_cost: number
  line_total: number
  notes: string | null
}

export type PurchaseOrder = {
  id: string
  order_number: string
  supplier_id: string
  supplier_name: string
  status: "draft" | "ordered" | "partially_received" | "received" | "cancelled"
  payment_status: "unpaid" | "partially_paid" | "paid" | "refunded"
  currency_code: string
  base_currency_code: string
  exchange_rate: number
  subtotal: number
  shipping_amount: number
  tax_amount: number
  discount_amount: number
  other_amount: number
  total_amount: number
  base_total_amount: number
  paid_amount: number
  outstanding_amount: number
  ordered_at: string | null
  expected_at: string | null
  received_at: string | null
  notes: string | null
  item_count?: number
  created_at: string
  updated_at: string
}

export type PurchaseOrderDetail = PurchaseOrder & {
  items: PurchaseItem[]
  payments: Array<{
    id: string
    amount: number
    currency_code: string
    payment_method: string | null
    transaction_reference: string | null
    paid_at: string
    notes: string | null
  }>
  receipts: Array<{
    id: string
    receipt_number: string
    warehouse_name: string | null
    received_at: string
    notes: string | null
    items: Array<{ id: string; order_item_id: string; quantity: number }>
  }>
  audits: Array<{
    id: string
    action: string
    admin_user_id: string | null
    created_at_event: string
  }>
}

export type SupplierListResponse = {
  suppliers: Supplier[]
  count: number
  page: number
  page_size: number
  page_count: number
}

export type PurchaseOrderListResponse = {
  purchase_orders: PurchaseOrder[]
  count: number
  page: number
  page_size: number
  page_count: number
}

export type ProcurementAnalytics = {
  summary: {
    total_orders: number
    active_orders: number
    base_currency_code: string
    total_amount: number
    paid_amount: number
    outstanding_amount: number
    average_order_amount: number
    overdue_orders: number
  }
  status_counts: Record<string, number>
  currency_totals: Array<{ currency_code: string; total: number }>
  supplier_totals: Array<{
    supplier_id: string
    supplier_name: string
    total: number
    orders: number
  }>
  monthly_totals: Array<{ month: string; total: number }>
}

export type PurchaseOrderFormItem = {
  product_id: string | null
  variant_id: string | null
  sku: string
  product_title: string
  variant_title: string
  supplier_sku: string
  supplier_url: string
  quantity: number
  unit_cost: number
  notes: string
}

export type PurchaseOrderFormValue = {
  supplier_id: string
  currency_code: string
  base_currency_code: string
  exchange_rate: number
  shipping_amount: number
  tax_amount: number
  discount_amount: number
  other_amount: number
  ordered_at: string
  expected_at: string
  notes: string
  items: PurchaseOrderFormItem[]
}
