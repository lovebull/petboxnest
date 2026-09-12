import { MedusaError } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { AFTER_SALES_MODULE } from "../../modules/after-sales";
import type AfterSalesModuleService from "../../modules/after-sales/service";

type Input = { id: string; customer_id: string };

const cancelRequest = createStep(
  "cancel-request",
  async (input: Input, { container }) => {
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const current = await service.retrieveAfterSalesRequest(input.id);
    if (current.customer_id !== input.customer_id)
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Request not found");
    if (current.status !== "pending_review")
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only a pending request can be cancelled",
      );
    const request = await service.updateAfterSalesRequests({
      id: current.id,
      status: "cancelled",
      completed_at: new Date(),
    });
    const history = await service.createAfterSalesStatusHistories({
      request_id: current.id,
      from_status: current.status,
      to_status: "cancelled",
      actor_type: "customer",
      actor_id: input.customer_id,
      note: null,
    });
    return new StepResponse(
      { request, history },
      { request: current, history_id: history.id },
    );
  },
  async (rollback: any, { container }) => {
    if (!rollback) return;
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    await service.deleteAfterSalesStatusHistories(rollback.history_id);
    await service.updateAfterSalesRequests(rollback.request);
  },
);

export const cancelAfterSalesRequestWorkflow = createWorkflow(
  "cancel-after-sales-request",
  function (input: Input) {
    return new WorkflowResponse(cancelRequest(input));
  },
);
