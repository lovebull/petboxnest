export type SalesSummary = {
  gross_sales: number
  discounts: number
  refunds: number
  net_sales: number
  shipping_total: number
  tax_total: number
  total_sales: number
  order_count: number
  units_sold: number
  average_order_value: number
  customer_count: number
  returning_customer_count: number
  returning_customer_rate: number
  fully_shipped_orders: number
  partially_shipped_orders: number
  refunded_orders: number
}

export type SalesAnalyticsResponse = {
  period: { date_from: string; date_to: string; previous_date_from: string; previous_date_to: string }
  currency_code: string
  available_currencies: string[]
  summary: SalesSummary
  previous_summary: SalesSummary
  series: Array<{ date: string; gross_sales: number; net_sales: number; total_sales: number; order_count: number }>
  sync_state: null | { status: string; last_completed_at?: string | null; processed_count: number; last_error?: string | null }
  definitions: Record<string, string>
}

export type SalesOrderFact = {
  id: string
  order_id: string
  display_id: number
  currency_code: string
  status: string
  fulfillment_status?: string | null
  order_day: string
  gross_sales: number | string
  refunds: number | string
  total_sales: number | string
  units_sold: number
  is_valid: boolean
  is_returning_customer: boolean
}

export type SalesOrdersResponse = {
  orders: SalesOrderFact[]
  count: number
  page: number
  page_size: number
  page_count: number
}

export type CommerceAnalyticsSummary = {
  total_sales: number
  order_count: number
  average_order_value: number
  customer_count: number
  returning_customer_count: number
  returning_customer_rate: number
  visits: number
  new_visits: number
  returning_visits: number
  added_to_cart_sessions: number
  checkout_sessions: number
  completed_sessions: number
  add_to_cart_rate: number
  checkout_rate: number
  conversion_rate: number
}

export type CommerceAnalyticsResponse = {
  period: {
    date_from: string
    date_to: string
    previous_date_from: string
    previous_date_to: string
    granularity: "hour" | "day"
  }
  currency_code: string
  available_currencies: string[]
  summary: CommerceAnalyticsSummary
  previous_summary: CommerceAnalyticsSummary
  series: Array<{
    bucket: string
    total_sales: number
    order_count: number
    visits: number
    new_visits: number
    returning_visits: number
    new_customers: number
    returning_customers: number
  }>
  definitions: Record<string, string>
}
