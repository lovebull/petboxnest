import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import {
  evaluateOrderMilestonesWorkflow,
  syncSalesOrderWorkflow,
} from "../workflows";

type OrderEvent = { id?: string; order_id?: string };

export default async function orderSalesAnalyticsHandler({
  event: { data },
  container,
}: SubscriberArgs<OrderEvent>) {
  const orderId = data.order_id || data.id;
  if (!orderId) return;
  await syncSalesOrderWorkflow(container).run({ input: { order_id: orderId } });
  await evaluateOrderMilestonesWorkflow(container).run({ input: {} });
}

export const config: SubscriberConfig = {
  event: [
    "order.placed",
    "order.updated",
    "order.canceled",
    "order.completed",
    "order.archived",
    "order.fulfillment_created",
    "order.fulfillment_canceled",
    "order.return_requested",
    "order.return_received",
    "order.claim_created",
    "order.exchange_created",
  ],
};
