import type { MedusaContainer } from "@medusajs/framework/types";
import { cleanupSalesAnalyticsWorkflow } from "../workflows";

export default async function cleanupSalesAnalytics(
  container: MedusaContainer,
) {
  await cleanupSalesAnalyticsWorkflow(container).run({ input: {} });
}

export const config = {
  name: "cleanup-sales-analytics",
  schedule: "31 4 * * *",
};
