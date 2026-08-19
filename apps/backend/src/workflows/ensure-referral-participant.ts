import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { ensureReferralParticipantStep } from "./steps/ensure-referral-participant"

export const ensureReferralParticipantWorkflow = createWorkflow(
  "ensure-referral-participant",
  function (input: { customer_id: string }) {
    return new WorkflowResponse(ensureReferralParticipantStep(input))
  }
)
