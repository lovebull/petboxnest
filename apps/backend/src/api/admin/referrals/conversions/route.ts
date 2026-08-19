import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { REFERRAL_MODULE } from "../../../../modules/referral"
import type ReferralModuleService from "../../../../modules/referral/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ReferralModuleService>(REFERRAL_MODULE)
  const query = req.validatedQuery as {
    status?: string
    limit: number
    offset: number
  }
  const [conversions, count] = await service.listAndCountReferralConversions(
    query.status ? { status: query.status as never } : {},
    {
      take: query.limit,
      skip: query.offset,
      order: { created_at: "DESC" },
    }
  )
  res.json({ referral_conversions: conversions, count })
}
