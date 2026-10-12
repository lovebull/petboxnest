import { MedusaError } from "@medusajs/framework/utils"
import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../modules/procurement"
import type ProcurementModuleService from "../modules/procurement/service"
import { roundAmount, toNumber } from "../modules/procurement/utils"
import type { RecordPaymentInput } from "../types"

const recordPaymentStep = createStep(
  "record-purchase-payment",
  async (input: RecordPaymentInput, { container }) => {
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const order = await service.retrievePurchaseOrder(input.order_id)
    if (order.status === "cancelled") {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Cancelled order cannot receive payments")
    }
    const amount = roundAmount(input.amount)
    if (amount <= 0 || input.currency_code.toLowerCase() !== order.currency_code) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Payment amount or currency is invalid")
    }
    const nextPaid = roundAmount(toNumber(order.paid_amount) + amount)
    const total = toNumber(order.total_amount)
    if (nextPaid > total) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Payment exceeds outstanding amount")
    }
    const outstanding = roundAmount(total - nextPaid)
    const [payment] = await service.createPurchasePayments([
      {
        order_id: order.id,
        amount,
        currency_code: order.currency_code,
        payment_method: input.payment_method?.trim() || null,
        transaction_reference: input.transaction_reference?.trim() || null,
        paid_at: input.paid_at ? new Date(input.paid_at) : new Date(),
        notes: input.notes?.trim() || null,
        created_by: input.admin_user_id || null,
      },
    ])
    const updated = await service.updatePurchaseOrders({
      id: order.id,
      paid_amount: nextPaid,
      outstanding_amount: outstanding,
      payment_status: outstanding === 0 ? "paid" : "partially_paid",
      updated_by: input.admin_user_id || null,
    })
    const [audit] = await service.createProcurementAudits([
      {
        entity_type: "purchase_order",
        entity_id: order.id,
        action: "payment_recorded",
        admin_user_id: input.admin_user_id || null,
        previous_values: { paid_amount: order.paid_amount, payment_status: order.payment_status },
        new_values: { payment_id: payment.id, paid_amount: nextPaid, payment_status: updated.payment_status },
        created_at_event: new Date(),
      },
    ])
    return new StepResponse(
      { payment, order: updated },
      { order, payment_id: payment.id, audit_id: audit.id }
    )
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const service = container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.deleteProcurementAudits(compensation.audit_id)
    await service.deletePurchasePayments(compensation.payment_id)
    await service.updatePurchaseOrders({
      id: compensation.order.id,
      paid_amount: compensation.order.paid_amount,
      outstanding_amount: compensation.order.outstanding_amount,
      payment_status: compensation.order.payment_status,
      updated_by: compensation.order.updated_by,
    })
  }
)

export const recordPurchasePaymentWorkflow = createWorkflow(
  "record-purchase-payment",
  function (input: RecordPaymentInput) {
    return new WorkflowResponse(recordPaymentStep(input))
  }
)
