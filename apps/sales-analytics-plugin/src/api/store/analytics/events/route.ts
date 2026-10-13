import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import type { StorefrontAnalyticsEventBody } from "../../../validators"
import { recordStorefrontAnalyticsEventWorkflow } from "../../../../workflows"

export async function POST(
  req: MedusaRequest<StorefrontAnalyticsEventBody>,
  res: MedusaResponse
) {
  const { result } = await recordStorefrontAnalyticsEventWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.status(202).json(result)
}
