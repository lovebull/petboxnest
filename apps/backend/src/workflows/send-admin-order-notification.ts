import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

import { sendNotificationStep } from "./steps/send-notification"

type WorkflowInput = { id: string; to: string; admin_url: string }

export const sendAdminOrderNotificationWorkflow = createWorkflow(
  "send-admin-order-notification",
  function (input: WorkflowInput) {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: ["id", "display_id", "email", "currency_code", "total", "items.id", "items.quantity"],
      filters: { id: input.id },
      options: { throwIfKeyNotFound: true },
    })

    const notification = sendNotificationStep([
      {
        to: input.to,
        channel: "email",
        template: "admin-order-placed",
        data: { order: orders[0], admin_url: input.admin_url },
      },
    ])

    return new WorkflowResponse({ notification })
  }
)
