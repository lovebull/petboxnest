import type { MedusaContainer } from "@medusajs/framework/types";
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { syncOrderProjection } from "../workflows/sync-sales-order";
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service";

/** Recompute projections through workflows without changing orders or payments. */
export default async function repairSalesAnalytics({ container }: { container: MedusaContainer }) {
  // Register after application loading so the currently deployed plugin cannot
  // replace this repair with its older registered workflow definition.
  const step = createStep("repair-sales-payment-status-step", async (_input: Record<string, never>, { container: scope }) => {
    const query = scope.resolve("query");
    let processed = 0;
    while (true) {
      const { data } = await query.graph({ entity: "order", fields: ["id"], pagination: { skip: processed, take: 100 } });
      for (const order of data) await syncOrderProjection(scope, order.id);
      processed += data.length;
      if (data.length < 100) break;
    }
    return new StepResponse({ processed_count: processed });
  });
  const workflow = createWorkflow("repair-sales-payment-status", function () {
    return new WorkflowResponse(step({}));
  });
  const { result } = await workflow(container).run({ input: {} });
  const service = container.resolve<SalesAnalyticsModuleService>("salesAnalytics");
  const summary = await service.getSalesSummary({
    date_from: "2026-01-01",
    date_to: new Date().toISOString().slice(0, 10),
    currency_code: "usd",
    timezone: process.env.SALES_ANALYTICS_TIMEZONE || "America/New_York",
  });
  console.log(JSON.stringify({ rebuild: result, order_count: summary.order_count, total_sales: summary.total_sales }));
}
