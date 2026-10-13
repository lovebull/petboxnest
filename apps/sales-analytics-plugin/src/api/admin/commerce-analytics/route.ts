import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SALES_ANALYTICS_MODULE } from "../../../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../../../modules/sales-analytics/service"
import { roundAmount, toNumber } from "../../../modules/sales-analytics/utils"
import type { CommerceAnalyticsQuery } from "../../validators"

type SalesFact = Awaited<
  ReturnType<SalesAnalyticsModuleService["listSalesOrderFacts"]>
>[number]
type Session = Awaited<
  ReturnType<SalesAnalyticsModuleService["listStorefrontAnalyticsSessions"]>
>[number]

const DAY_MS = 86_400_000
const isoDay = (date: Date) => date.toISOString().slice(0, 10)
const startOfDay = (day: string) => new Date(`${day}T00:00:00.000Z`)
const endOfDay = (day: string) => new Date(`${day}T23:59:59.999Z`)

const periodBefore = (dateFrom: string, dateTo: string) => {
  const days =
    Math.floor((startOfDay(dateTo).getTime() - startOfDay(dateFrom).getTime()) / DAY_MS) +
    1
  const previousTo = startOfDay(dateFrom)
  previousTo.setUTCDate(previousTo.getUTCDate() - 1)
  const previousFrom = new Date(previousTo)
  previousFrom.setUTCDate(previousFrom.getUTCDate() - days + 1)
  return {
    days,
    previousFrom: isoDay(previousFrom),
    previousTo: isoDay(previousTo),
  }
}

const salesSummary = (facts: SalesFact[]) => {
  const valid = facts.filter((fact) => fact.is_valid)
  const customers = new Set(valid.map((fact) => fact.customer_key).filter(Boolean))
  const returning = new Set(
    valid
      .filter((fact) => fact.is_returning_customer)
      .map((fact) => fact.customer_key)
      .filter(Boolean)
  )
  const totalSales = roundAmount(
    valid.reduce((sum, fact) => sum + toNumber(fact.total_sales), 0)
  )
  return {
    total_sales: totalSales,
    order_count: valid.length,
    average_order_value: valid.length
      ? roundAmount(totalSales / valid.length)
      : 0,
    customer_count: customers.size,
    returning_customer_count: returning.size,
    returning_customer_rate: customers.size
      ? roundAmount((returning.size / customers.size) * 100)
      : 0,
  }
}

const trafficSummary = (sessions: Session[]) => {
  const visits = sessions.length
  const added = sessions.filter((session) => session.has_added_to_cart).length
  const checkout = sessions.filter(
    (session) => session.has_started_checkout
  ).length
  const completed = sessions.filter(
    (session) => session.has_completed_order
  ).length
  const rate = (count: number) =>
    visits ? roundAmount((count / visits) * 100) : 0
  return {
    visits,
    new_visits: sessions.filter((session) => !session.is_returning_visitor)
      .length,
    returning_visits: sessions.filter(
      (session) => session.is_returning_visitor
    ).length,
    added_to_cart_sessions: added,
    checkout_sessions: checkout,
    completed_sessions: completed,
    add_to_cart_rate: rate(added),
    checkout_rate: rate(checkout),
    conversion_rate: rate(completed),
  }
}

const bucketKey = (value: Date | string, granularity: "hour" | "day") => {
  const iso = new Date(value).toISOString()
  return granularity === "hour" ? `${iso.slice(0, 13)}:00` : iso.slice(0, 10)
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(
    SALES_ANALYTICS_MODULE
  )
  const query = req.validatedQuery as CommerceAnalyticsQuery
  const today = new Date()
  const fallbackFrom = new Date(today)
  fallbackFrom.setUTCDate(fallbackFrom.getUTCDate() - 29)
  const dateFrom = query.date_from || isoDay(fallbackFrom)
  const dateTo = query.date_to || isoDay(today)

  if (startOfDay(dateFrom) > startOfDay(dateTo)) {
    res.status(400).json({ message: "date_from must not be after date_to" })
    return
  }

  const comparison = periodBefore(dateFrom, dateTo)
  const availableFacts = await service.listSalesOrderFacts(
    {},
    { select: ["currency_code"], take: 100_000 }
  )
  const availableCurrencies = Array.from(
    new Set(availableFacts.map((fact) => fact.currency_code))
  ).sort()
  const currencyCode = query.currency_code || availableCurrencies[0] || "usd"
  const facts = await service.listSalesOrderFacts(
    {
      currency_code: currencyCode,
      ordered_at: { $gte: startOfDay(dateFrom), $lte: endOfDay(dateTo) },
    },
    { take: 100_000, order: { ordered_at: "ASC" } }
  )
  const previousFacts = await service.listSalesOrderFacts(
    {
      currency_code: currencyCode,
      ordered_at: {
        $gte: startOfDay(comparison.previousFrom),
        $lte: endOfDay(comparison.previousTo),
      },
    },
    { take: 100_000 }
  )
  const sessions = await service.listStorefrontAnalyticsSessions(
    {
      started_at: { $gte: startOfDay(dateFrom), $lte: endOfDay(dateTo) },
    },
    { take: 100_000, order: { started_at: "ASC" } }
  )
  const previousSessions = await service.listStorefrontAnalyticsSessions(
    {
      started_at: {
        $gte: startOfDay(comparison.previousFrom),
        $lte: endOfDay(comparison.previousTo),
      },
    },
    { take: 100_000 }
  )

  const granularity: "hour" | "day" =
    query.granularity === "hour" ||
    (query.granularity === "auto" && comparison.days === 1)
      ? "hour"
      : "day"
  const seriesMap = new Map<
    string,
    {
      bucket: string
      total_sales: number
      order_count: number
      visits: number
      new_visits: number
      returning_visits: number
      new_customers: number
      returning_customers: number
    }
  >()
  const getBucket = (bucket: string) => {
    const existing = seriesMap.get(bucket)
    if (existing) return existing
    const next = {
      bucket,
      total_sales: 0,
      order_count: 0,
      visits: 0,
      new_visits: 0,
      returning_visits: 0,
      new_customers: 0,
      returning_customers: 0,
    }
    seriesMap.set(bucket, next)
    return next
  }

  for (const fact of facts.filter((entry) => entry.is_valid)) {
    const bucket = getBucket(bucketKey(fact.ordered_at, granularity))
    bucket.total_sales = roundAmount(
      bucket.total_sales + toNumber(fact.total_sales)
    )
    bucket.order_count += 1
    if (fact.customer_key) {
      if (fact.is_returning_customer) bucket.returning_customers += 1
      else bucket.new_customers += 1
    }
  }
  for (const session of sessions) {
    const bucket = getBucket(bucketKey(session.started_at, granularity))
    bucket.visits += 1
    if (session.is_returning_visitor) bucket.returning_visits += 1
    else bucket.new_visits += 1
  }

  res.json({
    period: {
      date_from: dateFrom,
      date_to: dateTo,
      previous_date_from: comparison.previousFrom,
      previous_date_to: comparison.previousTo,
      granularity,
    },
    currency_code: currencyCode,
    available_currencies: availableCurrencies,
    summary: {
      ...salesSummary(facts),
      ...trafficSummary(sessions),
    },
    previous_summary: {
      ...salesSummary(previousFacts),
      ...trafficSummary(previousSessions),
    },
    series: Array.from(seriesMap.values()).sort((a, b) =>
      a.bucket.localeCompare(b.bucket)
    ),
    definitions: {
      visits: "Unique anonymous shopping sessions with a 30-minute inactivity timeout.",
      conversion_rate: "Sessions with a completed order divided by all sessions.",
      returning_customer_rate:
        "Identified customers whose order is not their first valid order, divided by identified customers in the period.",
      average_order_value: "Total sales divided by valid orders in the selected currency.",
    },
  })
}
