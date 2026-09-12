import { MedusaError } from "@medusajs/framework/utils";
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  cancelOrderWorkflow,
  emitEventStep,
} from "@medusajs/medusa/core-flows";
import { AFTER_SALES_MODULE } from "../../modules/after-sales";
import type AfterSalesModuleService from "../../modules/after-sales/service";

export type AfterSalesStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "awaiting_shipment"
  | "in_transit"
  | "received"
  | "processing_refund"
  | "refunded"
  | "replacement_processing"
  | "completed"
  | "cancelled";
type Input = {
  id: string;
  status: AfterSalesStatus;
  admin_id: string;
  admin_note?: string | null;
  customer_message?: string | null;
  resolution?:
    | "replacement"
    | "partial_refund"
    | "full_refund"
    | "store_credit"
    | "no_action"
    | null;
  medusa_return_id?: string | null;
  medusa_exchange_id?: string | null;
  medusa_claim_id?: string | null;
};

const allowed: Record<string, string[]> = {
  pending_review: ["approved", "rejected", "cancelled"],
  approved: [
    "awaiting_shipment",
    "processing_refund",
    "replacement_processing",
    "completed",
    "cancelled",
  ],
  awaiting_shipment: ["in_transit", "received", "cancelled"],
  in_transit: ["received"],
  received: ["processing_refund", "replacement_processing", "completed"],
  processing_refund: ["refunded"],
  refunded: ["completed"],
  replacement_processing: ["completed"],
};

const updateStatusStep = createStep(
  "update-status",
  async (input: Input, { container }) => {
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const current = await service.retrieveAfterSalesRequest(input.id);
    if (!(allowed[current.status] || []).includes(input.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot change ${current.status} to ${input.status}`,
      );
    }
    const previous = { ...current };
    if (
      input.status === "processing_refund" &&
      !["partial_refund", "full_refund"].includes(
        input.resolution || current.resolution || "",
      )
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A partial or full refund resolution is required before processing a refund",
      );
    }
    const now = new Date();
    const request = await service.updateAfterSalesRequests({
      id: current.id,
      status: input.status,
      admin_note: input.admin_note ?? current.admin_note,
      customer_message: input.customer_message ?? current.customer_message,
      resolution: input.resolution ?? current.resolution,
      moderated_by: input.admin_id,
      approved_at: input.status === "approved" ? now : current.approved_at,
      completed_at: input.status === "completed" ? now : current.completed_at,
      medusa_return_id: input.medusa_return_id ?? current.medusa_return_id,
      medusa_exchange_id:
        input.medusa_exchange_id ?? current.medusa_exchange_id,
      medusa_claim_id: input.medusa_claim_id ?? current.medusa_claim_id,
    });
    const history = await service.createAfterSalesStatusHistories({
      request_id: current.id,
      from_status: current.status,
      to_status: input.status,
      actor_type: "admin",
      actor_id: input.admin_id,
      note: input.admin_note || null,
      public_note: input.customer_message || null,
    });
    return new StepResponse(
      { request, history },
      { previous, history_id: history.id },
    );
  },
  async (rollback: any, { container }) => {
    if (!rollback) return;
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    await service.deleteAfterSalesStatusHistories(rollback.history_id);
    await service.updateAfterSalesRequests(rollback.previous);
  },
);

const prepareStatusUpdateStep = createStep(
  "prepare-status-update",
  async (input: Input, { container }) => {
    const service =
      container.resolve<AfterSalesModuleService>(AFTER_SALES_MODULE);
    const request = await service.retrieveAfterSalesRequest(input.id);
    if (!(allowed[request.status] || []).includes(input.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot change ${request.status} to ${input.status}`,
      );
    }
    return new StepResponse({
      order_id: request.order_id,
      cancel_order: request.type === "cancel" && input.status === "approved",
    });
  },
);

export const updateAfterSalesStatusWorkflow = createWorkflow(
  "update-after-sales-status",
  function (input: Input) {
    const prepared = prepareStatusUpdateStep(input);
    const cancelInput = transform({ prepared }, ({ prepared }) => ({
      order_id: prepared.order_id,
    }));
    when({ prepared }, ({ prepared }) => prepared.cancel_order).then(() =>
      cancelOrderWorkflow.runAsStep({ input: cancelInput }),
    );
    const result = updateStatusStep(input);
    emitEventStep({ eventName: "after_sales.status_updated", data: result });
    return new WorkflowResponse(result);
  },
);
