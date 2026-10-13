import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { emitEventStep } from "@medusajs/medusa/core-flows";

export const requestSalesAnalyticsRebuildWorkflow = createWorkflow(
  "request-sales-analytics-rebuild",
  function () {
    emitEventStep({
      eventName: "sales-analytics.rebuild-requested",
      data: {},
    });
    return new WorkflowResponse({ accepted: true });
  },
);
