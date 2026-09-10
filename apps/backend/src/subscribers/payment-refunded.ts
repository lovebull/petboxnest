import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

import { sendRefundNotificationWorkflow } from "../workflows/send-refund-notification"

export default async function paymentRefundedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendRefundNotificationWorkflow(container).run({ input: data })
}

export const config: SubscriberConfig = { event: "payment.refunded" }
