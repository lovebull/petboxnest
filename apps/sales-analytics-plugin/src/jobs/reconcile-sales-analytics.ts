import type { MedusaContainer } from "@medusajs/framework/types";
import {
  evaluateOrderMilestonesWorkflow,
  rebuildSalesAnalyticsWorkflow,
} from "../workflows";

export default async function reconcileSalesAnalytics(
  container: MedusaContainer,
) {
  await rebuildSalesAnalyticsWorkflow(container).run({ input: {} });
  await evaluateOrderMilestonesWorkflow(container).run({ input: {} });
}

export const config = {
  name: "reconcile-sales-analytics",
  schedule: "17 3 * * *",
};
