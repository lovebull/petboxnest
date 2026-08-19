import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import type { BindReferralSchema } from "../../../../middlewares"
import { bindReferralToCartWorkflow } from "../../../../../workflows/bind-referral-to-cart"

export async function POST(
  req: MedusaRequest<BindReferralSchema>,
  res: MedusaResponse
) {
  const { result } = await bindReferralToCartWorkflow(req.scope).run({
    input: {
      cart_id: req.params.id,
      code: req.validatedBody.code,
    },
  })
  res.json({ referral_attribution: result.attribution })
}
