import { MedusaError, Modules } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { SALES_ANALYTICS_MODULE } from "../modules/sales-analytics";
import type SalesAnalyticsModuleService from "../modules/sales-analytics/service";

export type DismissOrderMilestoneInput = {
  milestone_id: string;
  admin_user_id: string;
};

type Compensation =
  | { action: "delete"; id: string }
  | { action: "restore"; previous: Record<string, unknown> };

const dismissOrderMilestoneStep = createStep(
  "dismiss-order-milestone",
  async (input: DismissOrderMilestoneInput, { container }) => {
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    const locking = container.resolve(Modules.LOCKING);
    const lockKey = `sales-analytics:order-milestone-ack:${input.milestone_id}:${input.admin_user_id}`;
    await locking.acquire(lockKey, { expire: 15 });

    try {
      const milestone = (
        await service.listOrderMilestones({ id: input.milestone_id })
      )[0];
      if (!milestone) {
        throw new MedusaError(
          MedusaError.Types.NOT_FOUND,
          "Order milestone not found",
        );
      }

      const existing = (
        await service.listOrderMilestoneAcknowledgements({
          milestone_id: milestone.id,
          admin_user_id: input.admin_user_id,
        })
      )[0];
      if (existing) {
        const acknowledgement =
          await service.updateOrderMilestoneAcknowledgements({
            id: existing.id,
            dismissed_at: new Date(),
          });
        return new StepResponse(acknowledgement, {
          action: "restore",
          previous: existing as unknown as Record<string, unknown>,
        } satisfies Compensation);
      }

      const acknowledgement =
        await service.createOrderMilestoneAcknowledgements({
          milestone_id: milestone.id,
          admin_user_id: input.admin_user_id,
          dismissed_at: new Date(),
        });
      return new StepResponse(acknowledgement, {
        action: "delete",
        id: acknowledgement.id,
      } satisfies Compensation);
    } finally {
      await locking.release(lockKey);
    }
  },
  async (compensation: Compensation | undefined, { container }) => {
    if (!compensation) return;
    const service = container.resolve<SalesAnalyticsModuleService>(
      SALES_ANALYTICS_MODULE,
    );
    if (compensation.action === "delete") {
      await service.deleteOrderMilestoneAcknowledgements(compensation.id);
      return;
    }
    await service.updateOrderMilestoneAcknowledgements(
      compensation.previous as never,
    );
  },
);

export const dismissOrderMilestoneWorkflow = createWorkflow(
  "dismiss-order-milestone-workflow",
  function (input: DismissOrderMilestoneInput) {
    const acknowledgement = dismissOrderMilestoneStep(input);
    return new WorkflowResponse(acknowledgement);
  },
);
