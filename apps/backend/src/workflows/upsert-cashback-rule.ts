import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import {
  upsertCashbackRuleStep,
  type UpsertCashbackRuleInput,
} from "./steps/upsert-cashback-rule"

export const upsertCashbackRuleWorkflow = createWorkflow(
  "upsert-cashback-rule",
  function (input: UpsertCashbackRuleInput) {
    const rule = upsertCashbackRuleStep(input)

    return new WorkflowResponse(rule)
  }
)
