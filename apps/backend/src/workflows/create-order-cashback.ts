import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"

import { createOrderCashbackStep } from "./steps/create-order-cashback"

export const createOrderCashbackWorkflow = createWorkflow(
  "create-order-cashback",
  function (input: { order_id: string }) {
    const entry = createOrderCashbackStep(input)

    return new WorkflowResponse(entry)
  }
)
