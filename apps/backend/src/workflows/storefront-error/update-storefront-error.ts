import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { STOREFRONT_ERROR_MODULE } from "../../modules/storefront-error"
import type StorefrontErrorModuleService from "../../modules/storefront-error/service"
import type { StorefrontErrorResolutionStatus } from "../../modules/storefront-error/types"

export type UpdateStorefrontErrorInput = {
  id: string
  resolution_status: StorefrontErrorResolutionStatus
  admin_note?: string | null
  admin_user_id: string
}

const updateStorefrontErrorStep = createStep(
  "update-storefront-error",
  async (input: UpdateStorefrontErrorInput, { container }) => {
    const service = container.resolve<StorefrontErrorModuleService>(STOREFRONT_ERROR_MODULE)
    const previous = await service.retrieveStorefrontError(input.id)
    const isOpen = input.resolution_status === "open"
    const record = await service.updateStorefrontErrors({
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
      .resolve<StorefrontErrorModuleService>(STOREFRONT_ERROR_MODULE)
      .updateStorefrontErrors({
        ...previous,
        resolved_at: previous.resolved_at ? new Date(previous.resolved_at) : null,
      })
  },
)

export const updateStorefrontErrorWorkflow = createWorkflow(
  "update-storefront-error",
  function (input: UpdateStorefrontErrorInput) {
    return new WorkflowResponse(updateStorefrontErrorStep(input))
  },
)
