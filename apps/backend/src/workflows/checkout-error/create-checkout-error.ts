import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { CHECKOUT_ERROR_MODULE } from "../../modules/checkout-error"
import type CheckoutErrorModuleService from "../../modules/checkout-error/service"
import type { CheckoutErrorResource } from "../../modules/checkout-error/types"

export type CreateCheckoutErrorInput = {
  error_id: string
  resource: CheckoutErrorResource
  code: string
  status_code?: number | null
  retryable: boolean
  cart_id_hash?: string | null
  region_id?: string | null
  country_code?: string | null
  occurred_at: string
}

const createCheckoutErrorStep = createStep(
  "create-checkout-error",
  async (input: CreateCheckoutErrorInput, { container }) => {
    const service = container.resolve<CheckoutErrorModuleService>(
      CHECKOUT_ERROR_MODULE
    )
    const [existing] = await service.listCheckoutErrors({
      error_id: input.error_id,
    })
    if (existing) {
      return new StepResponse(existing, null)
    }
    const record = await service.createCheckoutErrors({
      ...input,
      status_code: input.status_code ?? null,
      cart_id_hash: input.cart_id_hash ?? null,
      region_id: input.region_id ?? null,
      country_code: input.country_code ?? null,
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
        .resolve<CheckoutErrorModuleService>(CHECKOUT_ERROR_MODULE)
        .deleteCheckoutErrors(id)
    }
  }
)

export const createCheckoutErrorWorkflow = createWorkflow(
  "create-checkout-error",
  (input: CreateCheckoutErrorInput) =>
    new WorkflowResponse(createCheckoutErrorStep(input))
)
