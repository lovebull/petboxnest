import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { RESTOCK_MODULE } from "../../modules/restock"
import type RestockModuleService from "../../modules/restock/service"
import { CART_RECOVERY_MODULE } from "../../modules/cart-recovery"
import type CartRecoveryModuleService from "../../modules/cart-recovery/service"
import { hashAutomationToken } from "../../utils/commerce-automation-token"

type Input =
  | { feature: "restock"; token?: string; id?: string }
  | { feature: "cart_recovery"; token?: string; id?: string }

const updateStatusStep = createStep("update-status", async (input: Input, { container }) => {
  if (input.feature === "restock") {
    const service = container.resolve<RestockModuleService>(RESTOCK_MODULE)
    const filters = input.id ? { id: input.id } : { unsubscribe_token_hash: hashAutomationToken(input.token || "") }
    const [record] = await service.listRestockSubscriptions(filters)
    if (!record) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Subscription not found")
    const result = await service.updateRestockSubscriptions({ id: record.id, status: "unsubscribed", unsubscribed_at: new Date() })
    return new StepResponse<{ id: string; status: string }>({ id: result.id, status: result.status })
  }
  const service = container.resolve<CartRecoveryModuleService>(CART_RECOVERY_MODULE)
  const filters = input.id ? { id: input.id } : { unsubscribe_token_hash: hashAutomationToken(input.token || "") }
  const [record] = await service.listCartRecoveries(filters)
  if (!record) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Recovery subscription not found")
  const result = await service.updateCartRecoveries({ id: record.id, status: "unsubscribed", unsubscribed_at: new Date() })
  return new StepResponse<{ id: string; status: string }>({ id: result.id, status: result.status })
})

export const updateAutomationSubscriptionStatusWorkflow = createWorkflow(
  "update-automation-subscription-status",
  (input: Input) => {
    const result = updateStatusStep(input)
    return new WorkflowResponse(result)
  }
)
