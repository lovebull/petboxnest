import { MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CART_RECOVERY_MODULE } from "../../modules/cart-recovery"
import type CartRecoveryModuleService from "../../modules/cart-recovery/service"
import { hashAutomationToken, verifyRecoveryToken } from "../../utils/commerce-automation-token"

const consumeRecoveryStep = createStep("consume-recovery", async (
  input: { token: string }, { container }
) => {
  let payload: ReturnType<typeof verifyRecoveryToken>
  try { payload = verifyRecoveryToken(input.token) } catch {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "This recovery link is invalid or expired")
  }
  const service = container.resolve<CartRecoveryModuleService>(CART_RECOVERY_MODULE)
  const [recovery] = await service.listCartRecoveries({ id: payload.recovery_id })
  if (!recovery) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This recovery link has already been used or is no longer available")
  }
  const consumed = await service.consumeToken(recovery.id, hashAutomationToken(input.token))
  if (!consumed && new Date(recovery.token_expires_at) <= new Date() && recovery.status === "sent") {
    await service.updateCartRecoveries({ id: recovery.id, status: "expired" })
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "This recovery link has expired")
  }
  if (!consumed) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This recovery link has already been used or is no longer available")
  }
  await service.createCartRecoveryLogs({
    recovery_id: consumed.id,
    status: "recovered",
    attempt_count: consumed.send_count,
    notification_id: null,
    error_message: null,
    next_retry_at: null,
    triggered_at: new Date(),
    sent_at: new Date(),
  })
  return new StepResponse({ cart_id: consumed.cart_id, country_code: consumed.country_code || "us" })
})

export const consumeCartRecoveryWorkflow = createWorkflow(
  "consume-cart-recovery",
  (input: { token: string }) => {
    const result = consumeRecoveryStep(input)
    return new WorkflowResponse(result)
  }
)
