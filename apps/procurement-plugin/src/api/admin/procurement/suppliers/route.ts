import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import type ProcurementModuleService from "../../../../modules/procurement/service"
import type { ProcurementListQuery, SupplierBody } from "../../../validators"
import { upsertProcurementSupplierWorkflow } from "../../../../workflows"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const query = req.validatedQuery as ProcurementListQuery
  const filters: Record<string, unknown> = {}
  if (query.status && query.status !== "all") filters.status = query.status
  if (query.q) filters.name = { $like: `%${query.q}%` }
  const [suppliers, count] = await service.listAndCountProcurementSuppliers(filters, {
    take: query.limit,
    skip: (query.page - 1) * query.limit,
    order: { updated_at: "DESC" },
  })
  res.json({
    suppliers,
    count,
    page: query.page,
    page_size: query.limit,
    page_count: Math.max(1, Math.ceil(count / query.limit)),
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<SupplierBody>,
  res: MedusaResponse
) {
  const { result } = await upsertProcurementSupplierWorkflow(req.scope).run({
    input: { ...req.validatedBody, admin_user_id: req.auth_context.actor_id },
  })
  res.status(201).json({ supplier: result })
}
