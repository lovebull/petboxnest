import { createWorkflow, when, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"

import { sendNotificationStep } from "./steps/send-notification"

type WorkflowInput = { id: string }

export const sendRefundNotificationWorkflow = createWorkflow(
  "send-refund-notification",
  function (input: WorkflowInput) {
    const { data: payments } = useQueryGraphStep({
      entity: "payments",
      fields: [
        "id",
        "currency_code",
        "refunds.id",
        "refunds.amount",
        "refunds.created_at",
        "payment_collection.order.id",
        "payment_collection.order.display_id",
        "payment_collection.order.email",
        "payment_collection.order.currency_code",
        "payment_collection.order.customer.first_name",
        "payment_collection.order.billing_address.first_name",
      ],
      filters: { id: input.id },
      options: { throwIfKeyNotFound: true },
    })

    const notification = when(
      { payments },
      ({ payments: data }) => Boolean(data[0]?.payment_collection?.order?.email)
    ).then(() =>
      sendNotificationStep([
        {
          to: payments[0].payment_collection!.order!.email!,
          channel: "email",
          template: "payment-refunded",
          data: { order: payments[0].payment_collection!.order!, payment: payments[0] },
        },
      ])
    )

    return new WorkflowResponse({ notification })
  }
)
