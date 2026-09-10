import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

import { sendNotificationStep } from "./steps/send-notification"

type WorkflowInput = { id: string; no_notification?: boolean }

export const sendShipmentNotificationWorkflow = createWorkflow(
  "send-shipment-notification",
  function (input: WorkflowInput) {
    const { data: fulfillments } = useQueryGraphStep({
      entity: "fulfillment",
      fields: [
        "id",
        "shipped_at",
        "labels.id",
        "labels.tracking_number",
        "labels.tracking_url",
        "order.id",
        "order.display_id",
        "order.email",
        "order.customer.first_name",
        "order.shipping_address.first_name",
      ],
      filters: { id: input.id },
      options: { throwIfKeyNotFound: true },
    })

    const notification = when(
      { fulfillments, input },
      ({ fulfillments: data, input: workflowInput }) =>
        !workflowInput.no_notification && Boolean(data[0]?.order?.email)
    ).then(() =>
      sendNotificationStep([
        {
          to: fulfillments[0].order!.email!,
          channel: "email",
          template: "shipment-created",
          data: { order: fulfillments[0].order!, fulfillment: fulfillments[0] },
        },
      ])
    )

    return new WorkflowResponse({ notification })
  }
)
