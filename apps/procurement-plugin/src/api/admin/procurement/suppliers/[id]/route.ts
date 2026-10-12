import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { SupplierBody } from "../../../../validators"
import { upsertProcurementSupplierWorkflow } from "../../../../../workflows"

export async function POST(
  req: AuthenticatedMedusaRequest<SupplierBody>,
  res: MedusaResponse
) {
  const { result } = await upsertProcurementSupplierWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      id: req.params.id,
      admin_user_id: req.auth_context.actor_id,
    },
  })
  res.json({ supplier: result })
}
