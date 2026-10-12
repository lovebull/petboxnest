import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../modules/procurement"
import type ProcurementModuleService from "../modules/procurement/service"
import type { RecordReceiptInput } from "../types"

const receiptNumber = () =>
  `GRN-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${Date.now()
    .toString(36)
    .slice(-6)
    .toUpperCase()}`

const recordReceiptStep = createStep(
  "record-purchase-receipt",
  async (input: RecordReceiptInput, { container }) => {
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const order = await service.retrievePurchaseOrder(input.order_id)
    if (!['ordered', 'partially_received'].includes(order.status)) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "Only ordered purchase orders can receive stock"
      )
    }
    if (!input.items.length) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Receipt items are required")
    }
    const orderItems = await service.listPurchaseOrderItems({ order_id: order.id })
    const itemMap = new Map(orderItems.map((item) => [item.id, item]))
    const updates: Array<{ id: string; received_quantity: number }> = []
    for (const inputItem of input.items) {
      const item = itemMap.get(inputItem.order_item_id)
      if (!item || !Number.isInteger(inputItem.quantity) || inputItem.quantity <= 0) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Receipt item is invalid")
      }
      const received = item.received_quantity + inputItem.quantity
      if (received > item.quantity) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Received quantity exceeds ordered quantity for ${item.product_title}`
        )
      }
      updates.push({ id: item.id, received_quantity: received })
    }

    const updatedItems = await service.updatePurchaseOrderItems(updates)
    const allItems = orderItems.map((item) => {
      const updated = updatedItems.find((candidate) => candidate.id === item.id)
      return updated || item
    })
    const complete = allItems.every((item) => item.received_quantity >= item.quantity)
    const [receipt] = await service.createPurchaseReceipts([
      {
        order_id: order.id,
        receipt_number: input.receipt_number?.trim() || receiptNumber(),
        warehouse_name: input.warehouse_name?.trim() || null,
        received_at: input.received_at ? new Date(input.received_at) : new Date(),
        notes: input.notes?.trim() || null,
        created_by: input.admin_user_id || null,
      },
    ])
    const receiptItems = await service.createPurchaseReceiptItems(
      input.items.map((item) => ({
        receipt_id: receipt.id,
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        notes: item.notes?.trim() || null,
      }))
    )
    const updatedOrder = await service.updatePurchaseOrders({
      id: order.id,
      status: complete ? "received" : "partially_received",
      received_at: complete ? new Date() : order.received_at,
      updated_by: input.admin_user_id || null,
    })
    const [audit] = await service.createProcurementAudits([
      {
        entity_type: "purchase_order",
        entity_id: order.id,
        action: "receipt_recorded",
        admin_user_id: input.admin_user_id || null,
        previous_values: {
          status: order.status,
          items: orderItems.map((item) => ({ id: item.id, received_quantity: item.received_quantity })),
        },
        new_values: { receipt_id: receipt.id, status: updatedOrder.status, items: input.items },
        created_at_event: new Date(),
      },
    ])
    return new StepResponse(
      { receipt: { ...receipt, items: receiptItems }, order: updatedOrder },
      {
        order,
        previous_items: orderItems.map((item) => ({ id: item.id, received_quantity: item.received_quantity })),
        receipt_id: receipt.id,
        receipt_item_ids: receiptItems.map((item) => item.id),
        audit_id: audit.id,
      }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.deleteProcurementAudits(compensation.audit_id)
    if (compensation.receipt_item_ids.length) {
      await service.deletePurchaseReceiptItems(compensation.receipt_item_ids)
    }
    await service.deletePurchaseReceipts(compensation.receipt_id)
    await service.updatePurchaseOrderItems(compensation.previous_items)
    await service.updatePurchaseOrders({
      id: compensation.order.id,
      status: compensation.order.status,
      received_at: compensation.order.received_at,
      updated_by: compensation.order.updated_by,
    })
  }
)

export const recordPurchaseReceiptWorkflow = createWorkflow(
  "record-purchase-receipt",
  function (input: RecordReceiptInput) {
    return new WorkflowResponse(recordReceiptStep(input))
  }
)
