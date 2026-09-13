import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CART_RECOVERY_MODULE } from "../../../modules/cart-recovery"
import type CartRecoveryModuleService from "../../../modules/cart-recovery/service"

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { page, limit, status, q } = req.validatedQuery as any
  const service = req.scope.resolve<CartRecoveryModuleService>(CART_RECOVERY_MODULE)
  const filters: any = {}
  if (status) filters.status = status
  if (q) {
    const ids = await service.searchIds(q)
    filters.id = ids.length ? ids : "__none__"
  }
  const [recoveries, count] = await service.listAndCountCartRecoveries(filters, {
    take: limit, skip: (page - 1) * limit, order: { created_at: "DESC" },
  })
  const ids = recoveries.map((item) => item.id)
  const logs = ids.length ? await service.listCartRecoveryLogs({ recovery_id: ids }, { order: { created_at: "DESC" } }) : []
  res.json({ recoveries: recoveries.map((item) => ({ ...item, logs: logs.filter((log) => log.recovery_id === item.id) })), count, page, page_size: limit, page_count: Math.max(1, Math.ceil(count / limit)), summary: await service.getSummary() })
}
