import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SALES_ANALYTICS_MODULE } from "../../../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../../../modules/sales-analytics/service"
import { roundAmount, toNumber } from "../../../modules/sales-analytics/utils"
import type { SalesAnalyticsQuery } from "../../validators"

const isoDay = (date: Date) => date.toISOString().slice(0, 10)

const summarize = (facts: Awaited<ReturnType<SalesAnalyticsModuleService["listSalesOrderFacts"]>>) => {
  const valid = facts.filter((fact) => fact.is_valid)
  const customers = new Set(valid.map((fact) => fact.customer_key).filter(Boolean))
  const returning = new Set(
    valid
      .filter((fact) => fact.is_returning_customer)
      .map((fact) => fact.customer_key)
      .filter(Boolean)
  )
  const sum = (field: keyof (typeof valid)[number]) =>
    roundAmount(valid.reduce((total, fact) => total + toNumber(fact[field]), 0))
  const totalSales = sum("total_sales")
  return {
    gross_sales: sum("gross_sales"),
    discounts: sum("discounts"),
    refunds: sum("refunds"),
    net_sales: sum("net_sales"),
    shipping_total: sum("shipping_total"),
    tax_total: sum("tax_total"),
    total_sales: totalSales,
    order_count: valid.length,
    units_sold: valid.reduce((total, fact) => total + Number(fact.units_sold || 0), 0),
    average_order_value: valid.length ? roundAmount(totalSales / valid.length) : 0,
    customer_count: customers.size,
    returning_customer_count: returning.size,
    returning_customer_rate: customers.size
      ? roundAmount((returning.size / customers.size) * 100)
      : 0,
    fully_shipped_orders: valid.filter((fact) =>
      ["fulfilled", "shipped", "delivered"].includes(fact.fulfillment_status || "")
    ).length,
    partially_shipped_orders: valid.filter(
      (fact) => fact.fulfillment_status === "partially_fulfilled"
    ).length,
    refunded_orders: valid.filter((fact) => toNumber(fact.refunds) > 0).length,
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(SALES_ANALYTICS_MODULE)
  const query = req.validatedQuery as SalesAnalyticsQuery
  const today = new Date()
  const fallbackFrom = new Date(today)
  fallbackFrom.setUTCDate(fallbackFrom.getUTCDate() - 29)
  const dateFrom = query.date_from || isoDay(fallbackFrom)
  const dateTo = query.date_to || isoDay(today)
  const availableFacts = await service.listSalesOrderFacts({}, { order: { ordered_at: "ASC" } })
  const currencies = Array.from(new Set(availableFacts.map((fact) => fact.currency_code))).sort()
  const currencyCode = query.currency_code || currencies[0] || "usd"
  const facts = await service.listSalesOrderFacts({
    currency_code: currencyCode,
    order_day: { $gte: dateFrom, $lte: dateTo },
  })
  const daily = await service.listSalesDailyMetrics(
    {
      currency_code: currencyCode,
      metric_date: { $gte: dateFrom, $lte: dateTo },
    },
    { order: { metric_date: "ASC" } }
  )
  const milliseconds =
    new Date(`${dateTo}T00:00:00.000Z`).getTime() -
    new Date(`${dateFrom}T00:00:00.000Z`).getTime()
  const periodDays = Math.floor(milliseconds / 86_400_000) + 1
  const previousToDate = new Date(`${dateFrom}T00:00:00.000Z`)
  previousToDate.setUTCDate(previousToDate.getUTCDate() - 1)
  const previousFromDate = new Date(previousToDate)
  previousFromDate.setUTCDate(previousFromDate.getUTCDate() - periodDays + 1)
  const previousFacts = await service.listSalesOrderFacts({
    currency_code: currencyCode,
    order_day: { $gte: isoDay(previousFromDate), $lte: isoDay(previousToDate) },
  })
  const syncState = (await service.listSalesSyncStates({ sync_key: "historical-rebuild" }))[0]

  res.json({
    period: { date_from: dateFrom, date_to: dateTo, previous_date_from: isoDay(previousFromDate), previous_date_to: isoDay(previousToDate) },
    currency_code: currencyCode,
    available_currencies: currencies,
    summary: summarize(facts),
    previous_summary: summarize(previousFacts),
    series: daily.map((metric) => ({
      date: metric.metric_date,
      gross_sales: toNumber(metric.gross_sales),
      net_sales: toNumber(metric.net_sales),
      total_sales: toNumber(metric.total_sales),
      order_count: metric.order_count,
    })),
    sync_state: syncState || null,
    definitions: {
      gross_sales: "Original item subtotal before discounts, shipping and tax.",
      net_sales: "Item subtotal minus recorded refunds, never below zero.",
      total_sales: "Order total minus recorded refunds, never below zero.",
      returning_customer_rate: "Customers in the period whose order is not their first valid order, divided by identified customers in the period.",
    },
  })
}
