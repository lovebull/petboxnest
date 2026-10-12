import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import type ProcurementModuleService from "../../../../modules/procurement/service"
import type { ProcurementListQuery, PurchaseOrderBody } from "../../../validators"
import { upsertPurchaseOrderWorkflow } from "../../../../workflows"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const query = req.validatedQuery as ProcurementListQuery
  const filters: Record<string, unknown> = {}
  if (query.status && query.status !== "all") filters.status = query.status
  if (query.payment_status && query.payment_status !== "all") {
    filters.payment_status = query.payment_status
  }
  if (query.supplier_id) filters.supplier_id = query.supplier_id
  if (query.q) filters.order_number = { $like: `%${query.q}%` }
  if (query.date_from || query.date_to) {
    filters.created_at = {
      ...(query.date_from ? { $gte: new Date(`${query.date_from}T00:00:00.000Z`) } : {}),
      ...(query.date_to ? { $lte: new Date(`${query.date_to}T23:59:59.999Z`) } : {}),
    }
  }

  const [orders, count] = await service.listAndCountPurchaseOrders(filters, {
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    order: { created_at: "DESC" },
  })
  const ids = orders.map((order) => order.id)
  const items = ids.length
    ? await service.listPurchaseOrderItems({ order_id: ids })
    : []
  const itemCounts = new Map<string, number>()
  for (const item of items) {
    itemCounts.set(item.order_id, (itemCounts.get(item.order_id) || 0) + 1)
  }

  res.json({
    purchase_orders: orders.map((order) => ({
      ...order,
      item_count: itemCounts.get(order.id) || 0,
    })),
    count,
    page: query.page,
    page_size: query.limit,
    page_count: Math.max(1, Math.ceil(count / query.limit)),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<PurchaseOrderBody>,
  res: MedusaResponse
) {
  const { result } = await upsertPurchaseOrderWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.status(201).json({ purchase_order: result })
}
