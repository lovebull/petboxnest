import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import type ProcurementModuleService from "../../../../modules/procurement/service"
import { roundAmount, toNumber } from "../../../../modules/procurement/utils"
import type { ProcurementAnalyticsQuery } from "../../../validators"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const query = req.validatedQuery as ProcurementAnalyticsQuery
  const filters: Record<string, unknown> = {}
  if (query.date_from || query.date_to) {
    filters.created_at = {
      ...(query.date_from ? { $gte: new Date(`${query.date_from}T00:00:00.000Z`) } : {}),
      ...(query.date_to ? { $lte: new Date(`${query.date_to}T23:59:59.999Z`) } : {}),
    }
  }
  const orders = [] as Awaited<ReturnType<typeof service.listPurchaseOrders>>
  const take = 500
  let skip = 0
  while (true) {
    const page = await service.listPurchaseOrders(filters, {
      take,
      skip,
      order: { created_at: "ASC" },
    })
    orders.push(...page)
    if (page.length < take) break
    skip += take
  }

  const active = orders.filter((order) => order.status !== "cancelled")
  const status_counts: Record<string, number> = {}
  const supplierTotals = new Map<string, { supplier_id: string; supplier_name: string; total: number; orders: number }>()
  const currencyTotals = new Map<string, number>()
  const monthlyTotals = new Map<string, number>()
  let baseTotal = 0
  let basePaid = 0
  let overdue = 0
  const now = new Date()

  for (const order of orders) {
    status_counts[order.status] = (status_counts[order.status] || 0) + 1
  }
  for (const order of active) {
    const total = toNumber(order.total_amount)
    const rate = toNumber(order.exchange_rate) || 1
    const converted = toNumber(order.base_total_amount) || roundAmount(total * rate)
    baseTotal += converted
    basePaid += toNumber(order.paid_amount) * rate
    currencyTotals.set(order.currency_code, (currencyTotals.get(order.currency_code) || 0) + total)
    const supplier = supplierTotals.get(order.supplier_id) || {
      supplier_id: order.supplier_id,
      supplier_name: order.supplier_name,
      total: 0,
      orders: 0,
    }
    supplier.total += converted
    supplier.orders += 1
    supplierTotals.set(order.supplier_id, supplier)
    const month = new Date(order.created_at).toISOString().slice(0, 7)
    monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + converted)
    if (
      order.expected_at &&
      new Date(order.expected_at) < now &&
      !["received", "cancelled"].includes(order.status)
    ) {
      overdue += 1
    }
  }

  res.json({
    summary: {
      total_orders: orders.length,
      active_orders: active.length,
      base_currency_code: active[0]?.base_currency_code || "usd",
      total_amount: roundAmount(baseTotal),
      paid_amount: roundAmount(basePaid),
      outstanding_amount: roundAmount(baseTotal - basePaid),
      average_order_amount: active.length ? roundAmount(baseTotal / active.length) : 0,
      overdue_orders: overdue,
    },
    status_counts,
    currency_totals: Array.from(currencyTotals, ([currency_code, total]) => ({
      currency_code,
      total: roundAmount(total),
    })),
    supplier_totals: Array.from(supplierTotals.values())
      .map((entry) => ({ ...entry, total: roundAmount(entry.total) }))
      .sort((a, b) => b.total - a.total),
    monthly_totals: Array.from(monthlyTotals, ([month, total]) => ({
      month,
      total: roundAmount(total),
    })),
  })
}
