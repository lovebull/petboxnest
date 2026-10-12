import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service"
import {
  customerKey,
  roundAmount,
  toNumber,
  utcDay,
} from "../modules/sales-analytics/utils"

type OrderItem = {
  quantity?: number
  return_received_quantity?: number
  detail?: { return_received_quantity?: number }
}

type AnalyticsOrder = {
  id: string
  display_id: number
  customer_id?: string | null
  email?: string | null
  currency_code: string
  status: string
  payment_status?: string | null
  fulfillment_status?: string | null
  created_at: Date | string
  original_item_subtotal?: unknown
  item_subtotal?: unknown
  item_discount_total?: unknown
  shipping_total?: unknown
  tax_total?: unknown
  total?: unknown
  summary?: { refunded_total?: unknown }
  items?: OrderItem[]
}

const ORDER_FIELDS = [
  "id",
  "display_id",
  "customer_id",
  "email",
  "currency_code",
  "status",
  "payment_status",
  "fulfillment_status",
  "created_at",
  "original_item_subtotal",
  "item_subtotal",
  "item_discount_total",
  "shipping_total",
  "tax_total",
  "total",
  "summary.refunded_total",
  "items.quantity",
  "items.detail.return_received_quantity",
]

const recomputeDailyMetric = async (
  service: SalesAnalyticsModuleService,
  metricDate: string,
  currencyCode: string
) => {
  const facts = await service.listSalesOrderFacts({
    order_day: metricDate,
    currency_code: currencyCode,
    is_valid: true,
  })
  const sum = (field: keyof (typeof facts)[number]) =>
    roundAmount(facts.reduce((total, fact) => total + toNumber(fact[field]), 0))
  const customers = new Set(facts.map((fact) => fact.customer_key).filter(Boolean))
  const returningCustomers = new Set(
    facts
      .filter((fact) => fact.is_returning_customer)
      .map((fact) => fact.customer_key)
      .filter(Boolean)
  )
  const values = {
    metric_key: `${metricDate}:${currencyCode}`,
    metric_date: metricDate,
    currency_code: currencyCode,
    gross_sales: sum("gross_sales"),
    discounts: sum("discounts"),
    refunds: sum("refunds"),
    net_sales: sum("net_sales"),
    shipping_total: sum("shipping_total"),
    tax_total: sum("tax_total"),
    total_sales: sum("total_sales"),
    order_count: facts.length,
    units_sold: facts.reduce((total, fact) => total + Number(fact.units_sold || 0), 0),
    fully_shipped_orders: facts.filter((fact) =>
      ["fulfilled", "shipped", "delivered"].includes(fact.fulfillment_status || "")
    ).length,
    partially_shipped_orders: facts.filter(
      (fact) => fact.fulfillment_status === "partially_fulfilled"
    ).length,
    customer_count: customers.size,
    returning_customer_count: returningCustomers.size,
    calculated_at: new Date(),
  }
  const existing = await service.listSalesDailyMetrics({ metric_key: values.metric_key })
  if (existing[0]) {
    await service.updateSalesDailyMetrics({ id: existing[0].id, ...values })
  } else {
    await service.createSalesDailyMetrics(values)
  }
}

export const syncOrderProjection = async (
  container: MedusaContainer,
  orderId: string
) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const service = container.resolve<SalesAnalyticsModuleService>(SALES_ANALYTICS_MODULE)
  const { data } = await query.graph({
    entity: "order",
    fields: ORDER_FIELDS,
    filters: { id: orderId },
  })
  const order = data[0] as AnalyticsOrder | undefined
  if (!order) return null

  const previous = (await service.listSalesOrderFacts({ order_id: order.id }))[0]
  const key = customerKey(order.customer_id, order.email)
  const gross = toNumber(order.original_item_subtotal)
  const itemSubtotal = toNumber(order.item_subtotal)
  const explicitDiscount = toNumber(order.item_discount_total)
  const discounts = Math.max(explicitDiscount, gross - itemSubtotal, 0)
  const refunds = Math.max(0, toNumber(order.summary?.refunded_total))
  const shipping = toNumber(order.shipping_total)
  const tax = toNumber(order.tax_total)
  const total = toNumber(order.total)
  const unitsOrdered = (order.items || []).reduce(
    (sum, item) => sum + toNumber(item.quantity),
    0
  )
  const unitsReturned = (order.items || []).reduce(
    (sum, item) =>
      sum + toNumber(item.detail?.return_received_quantity ?? item.return_received_quantity),
    0
  )
  const isValid = !["draft", "canceled"].includes(order.status)
  const factValues = {
    order_id: order.id,
    display_id: order.display_id,
    customer_id: order.customer_id || null,
    customer_key: key,
    currency_code: order.currency_code.toLowerCase(),
    status: order.status,
    payment_status: order.payment_status || null,
    fulfillment_status: order.fulfillment_status || null,
    order_day: utcDay(order.created_at),
    ordered_at: new Date(order.created_at),
    gross_sales: roundAmount(gross),
    discounts: roundAmount(discounts),
    refunds: roundAmount(refunds),
    net_sales: roundAmount(Math.max(0, itemSubtotal - refunds)),
    shipping_total: roundAmount(shipping),
    tax_total: roundAmount(tax),
    total_sales: roundAmount(Math.max(0, total - refunds)),
    units_ordered: unitsOrdered,
    units_returned: unitsReturned,
    units_sold: Math.max(0, unitsOrdered - unitsReturned),
    is_valid: isValid,
    is_returning_customer: false,
    synced_at: new Date(),
  }
  const fact = previous
    ? await service.updateSalesOrderFacts({ id: previous.id, ...factValues })
    : await service.createSalesOrderFacts(factValues)

  const affected = new Set<string>([
    `${fact.order_day}:${fact.currency_code}`,
    ...(previous ? [`${previous.order_day}:${previous.currency_code}`] : []),
  ])
  if (key) {
    const customerFacts = await service.listSalesOrderFacts(
      { customer_key: key, is_valid: true },
      { order: { ordered_at: "ASC" } }
    )
    for (let index = 0; index < customerFacts.length; index += 1) {
      const customerFact = customerFacts[index]
      const shouldReturn = index > 0
      if (customerFact.is_returning_customer !== shouldReturn) {
        await service.updateSalesOrderFacts({
          id: customerFact.id,
          is_returning_customer: shouldReturn,
        })
      }
      affected.add(`${customerFact.order_day}:${customerFact.currency_code}`)
    }
    const lifetime = customerFacts.reduce<Record<string, number>>((totals, entry) => {
      totals[entry.currency_code] = roundAmount(
        (totals[entry.currency_code] || 0) + toNumber(entry.total_sales)
      )
      return totals
    }, {})
    const customer = (await service.listSalesCustomerFacts({ customer_key: key }))[0]
    const customerValues = {
      customer_key: key,
      customer_id: order.customer_id || null,
      first_order_at: new Date(customerFacts[0]?.ordered_at || order.created_at),
      last_order_at: new Date(
        customerFacts[customerFacts.length - 1]?.ordered_at || order.created_at
      ),
      order_count: customerFacts.length,
      lifetime_sales_by_currency: lifetime,
      calculated_at: new Date(),
    }
    if (customer) {
      await service.updateSalesCustomerFacts({ id: customer.id, ...customerValues })
    } else {
      await service.createSalesCustomerFacts(customerValues)
    }
  }

  for (const metricKey of affected) {
    const separator = metricKey.lastIndexOf(":")
    await recomputeDailyMetric(
      service,
      metricKey.slice(0, separator),
      metricKey.slice(separator + 1)
    )
  }
  return fact
}

const syncSalesOrderStep = createStep(
  "sync-sales-order-projection",
  async ({ order_id }: { order_id: string }, { container }) => {
    const fact = await syncOrderProjection(container, order_id)
    return new StepResponse(fact)
  }
)

export const syncSalesOrderWorkflow = createWorkflow(
  "sync-sales-order-projection",
  function (input: { order_id: string }) {
    const fact = syncSalesOrderStep(input)
    return new WorkflowResponse(fact)
  }
)

export { ORDER_FIELDS, recomputeDailyMetric }
