import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { reconcileReferralCommissionWorkflow } from "../../../../../../workflows/reconcile-referral-commission"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await reconcileReferralCommissionWorkflow(req.scope).run({
    input: { conversion_id: req.params.id },
  })
  res.json({ referral_conversion: result })
}
