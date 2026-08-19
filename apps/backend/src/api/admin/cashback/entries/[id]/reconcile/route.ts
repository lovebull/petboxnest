import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { reconcileCashbackWorkflow } from "../../../../../../workflows/reconcile-cashback"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await reconcileCashbackWorkflow(req.scope).run({
    input: { entry_id: req.params.id },
  })

  res.json({ cashback_entry: result })
}
