import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { rebuildSalesAnalyticsWorkflow } from "../../../../workflows"

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { result } = await rebuildSalesAnalyticsWorkflow(req.scope).run({ input: {} })
  res.json(result)
}
