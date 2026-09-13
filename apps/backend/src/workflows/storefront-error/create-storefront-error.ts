import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { STOREFRONT_ERROR_MODULE } from "../../modules/storefront-error"
import type StorefrontErrorModuleService from "../../modules/storefront-error/service"
import type { StorefrontErrorScope } from "../../modules/storefront-error/types"

export type CreateStorefrontErrorInput = {
  error_id: string
  scope: StorefrontErrorScope
  code: string
  retryable: boolean
  country_code?: string | null
  route_key: string
  digest?: string | null
  occurred_at: string
}

const createStorefrontErrorStep = createStep(
  "create-storefront-error",
  async (input: CreateStorefrontErrorInput, { container }) => {
    const service = container.resolve<StorefrontErrorModuleService>(
      STOREFRONT_ERROR_MODULE,
    )
    const [existing] = await service.listStorefrontErrors({
      error_id: input.error_id,
    })
    if (existing) return new StepResponse(existing, null)

    const record = await service.createStorefrontErrors({
      ...input,
      country_code: input.country_code ?? null,
      digest: input.digest ?? null,
      occurred_at: new Date(input.occurred_at),
      source: "storefront",
      resolution_status: "open",
      admin_note: null,
      resolved_by: null,
      resolved_at: null,
    })
    return new StepResponse(record, record.id)
  },
  async (id: string | null | undefined, { container }) => {
    if (id) {
      await container
        .resolve<StorefrontErrorModuleService>(STOREFRONT_ERROR_MODULE)
        .deleteStorefrontErrors(id)
    }
  },
)

export const createStorefrontErrorWorkflow = createWorkflow(
  "create-storefront-error",
  function (input: CreateStorefrontErrorInput) {
    return new WorkflowResponse(createStorefrontErrorStep(input))
  },
)
