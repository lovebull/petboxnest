import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";

import { sendRefundNotificationWorkflow } from "../workflows/send-refund-notification";
import { syncRefundedPaymentWorkflow } from "../workflows/after-sales/sync-refunded-payment";

export default async function paymentRefundedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await Promise.all([
    sendRefundNotificationWorkflow(container).run({ input: data }),
    syncRefundedPaymentWorkflow(container).run({ input: data }),
  ]);
}

export const config: SubscriberConfig = { event: "payment.refunded" };
