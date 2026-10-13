import { Modules } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics";
import { ORDER_MILESTONE_THRESHOLDS } from "../modules/sales-analytics/order-milestones";
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service";

const evaluateOrderMilestonesStep = createStep(
  "evaluate-order-milestones",
  async (_input: Record<string, never>, { container }) => {
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    const locking = container.resolve(Modules.LOCKING);
    const lockKey = "sales-analytics:order-milestones";
    await locking.acquire(lockKey, { expire: 30 });

    try {
      const orderCount = await service.getValidOrderCount();
      const achieved = await service.listOrderMilestones();
      const achievedThresholds = new Set(
        achieved.map((milestone) => milestone.threshold),
      );
      const crossed = ORDER_MILESTONE_THRESHOLDS.filter(
        (threshold) =>
          threshold <= orderCount && !achievedThresholds.has(threshold),
      );
      const created = crossed.length
        ? await service.createOrderMilestones(
            crossed.map((threshold) => ({
              threshold,
              achieved_order_count: orderCount,
              achieved_at: new Date(),
            })),
          )
        : [];

      return new StepResponse(
        {
          order_count: orderCount,
          created_count: created.length,
          created,
        },
        created.map((milestone) => milestone.id),
      );
    } finally {
      await locking.release(lockKey);
    }
  },
  async (createdIds: string[] | undefined, { container }) => {
    if (!createdIds?.length) return;
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    await service.deleteOrderMilestones(createdIds);
  },
);

export const evaluateOrderMilestonesWorkflow = createWorkflow(
  "evaluate-order-milestones-workflow",
  function () {
    const result = evaluateOrderMilestonesStep({});
    return new WorkflowResponse(result);
  },
);
