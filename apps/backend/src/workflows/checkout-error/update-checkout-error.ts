import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { CHECKOUT_ERROR_MODULE } from "../../modules/checkout-error"
import type CheckoutErrorModuleService from "../../modules/checkout-error/service"
import type { CheckoutErrorResolutionStatus } from "../../modules/checkout-error/types"

export type UpdateCheckoutErrorInput = {
  id: string
  resolution_status: CheckoutErrorResolutionStatus
  admin_note?: string | null
  admin_user_id: string
}

const updateCheckoutErrorStep = createStep(
  "update-checkout-error",
  async (input: UpdateCheckoutErrorInput, { container }) => {
    const service = container.resolve<CheckoutErrorModuleService>(
      CHECKOUT_ERROR_MODULE
    )
    const previous = await service.retrieveCheckoutError(input.id)
    const isOpen = input.resolution_status === "open"
    const record = await service.updateCheckoutErrors({
      id: input.id,
      resolution_status: input.resolution_status,
      admin_note: input.admin_note?.trim() || null,
      resolved_by: isOpen ? null : input.admin_user_id,
      resolved_at: isOpen ? null : new Date(),
    })
    return new StepResponse(record, {
      id: previous.id,
      resolution_status: previous.resolution_status,
      admin_note: previous.admin_note,
      resolved_by: previous.resolved_by,
      resolved_at: previous.resolved_at,
    })
  },
  async (previous, { container }) => {
    if (!previous) return
    await container
      .resolve<CheckoutErrorModuleService>(CHECKOUT_ERROR_MODULE)
      .updateCheckoutErrors({
        ...previous,
        resolved_at: previous.resolved_at
          ? new Date(previous.resolved_at)
          : null,
      })
  }
)

export const updateCheckoutErrorWorkflow = createWorkflow(
  "update-checkout-error",
  (input: UpdateCheckoutErrorInput) =>
    new WorkflowResponse(updateCheckoutErrorStep(input))
)
