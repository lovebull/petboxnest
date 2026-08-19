import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { createReferralConversionStep } from "./steps/create-referral-conversion"

export const createReferralConversionWorkflow = createWorkflow(
  "create-referral-conversion",
  function (input: { order_id: string }) {
    return new WorkflowResponse(createReferralConversionStep(input))
  }
)
