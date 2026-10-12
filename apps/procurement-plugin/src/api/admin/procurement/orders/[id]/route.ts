import type {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { PROCUREMENT_MODULE } from "../../../../../modules/procurement"
import type ProcurementModuleService from "../../../../../modules/procurement/service"
import { retrievePurchaseOrderDetail } from "../../../../../modules/procurement/utils"
import type { PurchaseOrderBody } from "../../../../validators"
import { upsertPurchaseOrderWorkflow } from "../../../../../workflows"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
  const purchaseOrder = await retrievePurchaseOrderDetail(service, req.params.id)
  res.json({ purchase_order: purchaseOrder })
}

export async function POST(
  req: AuthenticatedMedusaRequest<PurchaseOrderBody>,
  res: MedusaResponse
) {
  const { result } = await upsertPurchaseOrderWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      id: req.params.id,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.json({ purchase_order: result })
}
