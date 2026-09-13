import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RESTOCK_MODULE } from "../../../modules/restock"
import type RestockModuleService from "../../../modules/restock/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { page, limit, status, q } = req.validatedQuery as any
  const service = req.scope.resolve<RestockModuleService>(RESTOCK_MODULE)
  const filters: any = {}
  if (status) filters.status = status
  if (q) {
    const ids = await service.searchIds(q)
    filters.id = ids.length ? ids : "__none__"
  }
  const [subscriptions, count] = await service.listAndCountRestockSubscriptions(filters, {
    take: limit, skip: (page - 1) * limit, order: { created_at: "DESC" },
  })
  const ids = subscriptions.map((item) => item.id)
  const logs = ids.length ? await service.listRestockNotificationLogs({ subscription_id: ids }, { order: { created_at: "DESC" } }) : []
  res.json({ subscriptions: subscriptions.map((item) => ({ ...item, logs: logs.filter((log) => log.subscription_id === item.id) })), count, page, page_size: limit, page_count: Math.max(1, Math.ceil(count / limit)), summary: await service.getSummary() })
}
