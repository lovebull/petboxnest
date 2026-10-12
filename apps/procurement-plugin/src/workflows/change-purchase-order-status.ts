import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../modules/procurement"
import type ProcurementModuleService from "../modules/procurement/service"
import type { PurchaseOrderStatus } from "../types"

export type ChangePurchaseOrderStatusInput = {
  order_id: string
  status: PurchaseOrderStatus
  admin_user_id?: string | null
}

const transitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  draft: ["ordered", "cancelled"],
  ordered: ["partially_received", "received", "cancelled"],
  partially_received: ["received", "cancelled"],
  received: [],
  cancelled: [],
}

const changeStatusStep = createStep(
  "change-purchase-order-status",
  async (input: ChangePurchaseOrderStatusInput, { container }) => {
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const previous = await service.retrievePurchaseOrder(input.order_id)
    if (!transitions[previous.status as PurchaseOrderStatus].includes(input.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Cannot change purchase order from ${previous.status} to ${input.status}`
      )
    }
    const now = new Date()
    const order = await service.updatePurchaseOrders({
      id: input.order_id,
      status: input.status,
      ordered_at:
        input.status === "ordered" && !previous.ordered_at ? now : previous.ordered_at,
      received_at: input.status === "received" ? now : previous.received_at,
      updated_by: input.admin_user_id || null,
    })
    const [audit] = await service.createProcurementAudits([
      {
        entity_type: "purchase_order",
        entity_id: input.order_id,
        action: `status:${previous.status}->${input.status}`,
        admin_user_id: input.admin_user_id || null,
        previous_values: { status: previous.status },
        new_values: { status: input.status },
        created_at_event: now,
      },
    ])
    return new StepResponse(order, { previous, audit_id: audit.id })
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.deleteProcurementAudits(compensation.audit_id)
    await service.updatePurchaseOrders({
      id: compensation.previous.id,
      status: compensation.previous.status,
      ordered_at: compensation.previous.ordered_at,
      received_at: compensation.previous.received_at,
      updated_by: compensation.previous.updated_by,
    })
  }
)

export const changePurchaseOrderStatusWorkflow = createWorkflow(
  "change-purchase-order-status",
  function (input: ChangePurchaseOrderStatusInput) {
    return new WorkflowResponse(changeStatusStep(input))
  }
)
