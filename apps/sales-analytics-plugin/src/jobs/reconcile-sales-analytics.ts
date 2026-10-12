import type { MedusaContainer } from "@medusajs/framework/types"
import { rebuildSalesAnalyticsWorkflow } from "../workflows"

export default async function reconcileSalesAnalytics(container: MedusaContainer) {
  await rebuildSalesAnalyticsWorkflow(container).run({ input: {} })
}

export const config = {
  name: "reconcile-sales-analytics",
  schedule: "17 3 * * *",
}
