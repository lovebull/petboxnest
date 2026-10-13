import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { rebuildSalesAnalyticsWorkflow } from "../workflows";

export default async function rebuildSalesAnalyticsHandler({
  container,
}: SubscriberArgs<Record<string, never>>) {
  await rebuildSalesAnalyticsWorkflow(container).run({ input: {} });
}

export const config: SubscriberConfig = {
  event: "sales-analytics.rebuild-requested",
};
