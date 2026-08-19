import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import { ensureReferralParticipantWorkflow } from "../../../../../../workflows/ensure-referral-participant"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { result } = await ensureReferralParticipantWorkflow(req.scope).run({
    input: { customer_id: req.auth_context.actor_id },
  })
  res.json({ referral_participant: result })
}
