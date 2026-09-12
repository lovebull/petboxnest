import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { AFTER_SALES_MODULE } from "../../modules/after-sales";
import type AfterSalesModuleService from "../../modules/after-sales/service";

const syncRefundedPaymentStep = createStep(
  "sync-refunded-payment",
  async (input: { id: string }, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY);
    const { data: payments } = await query.graph({
      entity: "payments",
      fields: ["id", "payment_collection.order.id"],
      filters: { id: input.id },
    });
    const orderId = (payments[0] as any)?.payment_collection?.order?.id;
    if (!orderId) return new StepResponse({ requests: [] });

    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const candidates = await service.listAfterSalesRequests({
      order_id: orderId,
      resolution: ["partial_refund", "full_refund"],
    });
    const active = candidates.filter(
      (request) => request.status === "processing_refund",
    );
    const previous = active.map((request) => ({ ...request }));
    const requests: Array<(typeof active)[number]> = [];
    const historyIds: string[] = [];

    for (const current of active) {
      const request = await service.updateAfterSalesRequests({
        id: current.id,
        status: "refunded",
      });
      const history = await service.createAfterSalesStatusHistories({
        request_id: current.id,
        from_status: current.status,
        to_status: "refunded",
        actor_type: "system",
        actor_id: null,
        note: "Refund confirmed by the payment provider.",
        public_note: "Your refund has been confirmed by the payment provider.",
      });
      requests.push(request);
      historyIds.push(history.id);
    }

    return new StepResponse(
      { requests },
      { previous, history_ids: historyIds },
    );
  },
  async (rollback: any, { container }) => {
    if (!rollback) return;
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    if (rollback.history_ids.length) {
      await service.deleteAfterSalesStatusHistories(rollback.history_ids);
    }
    for (const request of rollback.previous) {
      await service.updateAfterSalesRequests(request);
    }
  },
);

export const syncRefundedPaymentWorkflow = createWorkflow(
  "sync-refunded-payment",
  function (input: { id: string }) {
    return new WorkflowResponse(syncRefundedPaymentStep(input));
  },
);
