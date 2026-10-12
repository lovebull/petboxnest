import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SALES_ANALYTICS_MODULE } from "../../../../modules/sales-analytics"
import type SalesAnalyticsModuleService from "../../../../modules/sales-analytics/service"
import type { SalesOrdersQuery } from "../../../validators"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<SalesAnalyticsModuleService>(SALES_ANALYTICS_MODULE)
  const query = req.validatedQuery as SalesOrdersQuery
  const filters: Record<string, unknown> = {}
  if (query.currency_code) filters.currency_code = query.currency_code
  if (query.fulfillment_status) filters.fulfillment_status = query.fulfillment_status
  if (query.date_from || query.date_to) {
    filters.order_day = {
      ...(query.date_from ? { $gte: query.date_from } : {}),
      ...(query.date_to ? { $lte: query.date_to } : {}),
    }
  }
  const [orders, count] = await service.listAndCountSalesOrderFacts(filters, {
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    order: { ordered_at: "DESC" },
  })
  res.json({
    orders,
    count,
    page: query.page,
    page_size: query.limit,
    page_count: Math.max(1, Math.ceil(count / query.limit)),
  })
}
