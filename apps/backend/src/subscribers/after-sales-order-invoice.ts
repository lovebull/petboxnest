import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { issueOrderInvoiceWorkflow } from "../workflows/after-sales/issue-order-invoice";

export default async function issueOrderInvoice({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await issueOrderInvoiceWorkflow(container).run({
    input: { order_id: data.id },
  });
}

export const config: SubscriberConfig = { event: "order.placed" };
