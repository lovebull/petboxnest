import { ContainerRegistrationKeys, Modules, MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { CART_RECOVERY_MODULE } from "../../modules/cart-recovery"
import type CartRecoveryModuleService from "../../modules/cart-recovery/service"
import { createOpaqueToken, createRecoveryToken, hashAutomationToken } from "../../utils/commerce-automation-token"

const sendCartRecoveryStep = createStep("send-cart-recovery", async (
  input: { recovery_id: string }, { container }
) => {
  const service = container.resolve<CartRecoveryModuleService>(CART_RECOVERY_MODULE)
  const [recovery] = await service.listCartRecoveries({ id: input.recovery_id })
  if (!recovery || ["recovered", "unsubscribed", "expired"].includes(recovery.status)) {
    return new StepResponse({ skipped: true, sent: false, recovery_id: input.recovery_id })
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "email", "metadata", "completed_at", "currency_code", "total", "items.id", "items.title", "items.quantity", "items.unit_price", "items.thumbnail"],
    filters: { id: recovery.cart_id },
  })
  const cart = carts[0] as any
  if (!cart || cart.completed_at || !cart.items?.length) {
    await service.updateCartRecoveries({ id: recovery.id, status: "expired" })
    return new StepResponse({ skipped: true, sent: false, recovery_id: recovery.id })
  }
  if (cart.metadata?.abandoned_cart_consent !== true) {
    await service.updateCartRecoveries({ id: recovery.id, status: "unsubscribed", unsubscribed_at: new Date() })
    return new StepResponse({ skipped: true, sent: false, recovery_id: recovery.id })
  }
  const attemptCount = recovery.send_count + 1
  if (attemptCount > 3) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Maximum recovery attempts reached")
  const log = await service.createCartRecoveryLogs({
    recovery_id: recovery.id,
    status: "pending",
    attempt_count: attemptCount,
    notification_id: null,
    error_message: null,
    next_retry_at: null,
    triggered_at: new Date(),
    sent_at: null,
  })
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)
  const recoveryToken = createRecoveryToken(recovery.id, expiresAt)
  const unsubscribeToken = createOpaqueToken()
  const storefrontUrl = (process.env.STOREFRONT_URL || "http://localhost:7000").replace(/\/$/, "")
  const country = recovery.country_code || "us"
  try {
    const notification = await container.resolve(Modules.NOTIFICATION).createNotifications({
      to: recovery.email,
      channel: "email",
      template: "abandoned-cart",
      trigger_type: "cart.abandoned",
      resource_id: recovery.id,
      resource_type: "cart_recovery",
      data: {
        items: cart.items,
        currency_code: cart.currency_code,
        total: cart.total,
        recovery_url: `${storefrontUrl}/${country}/cart/recover?token=${recoveryToken}`,
        unsubscribe_url: `${storefrontUrl}/${country}/cart-recovery/unsubscribe?token=${unsubscribeToken}`,
        expires_at: expiresAt.toISOString(),
      },
    })
    if (!notification?.[0] || notification[0].status === "failure") throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Notification provider reported a delivery failure")
    await service.updateCartRecoveries({
      id: recovery.id,
      status: "sent",
      token_hash: hashAutomationToken(recoveryToken),
      token_expires_at: expiresAt,
      unsubscribe_token_hash: hashAutomationToken(unsubscribeToken),
      send_count: attemptCount,
      last_sent_at: new Date(),
    })
    await service.updateCartRecoveryLogs({
      id: log.id,
      status: "sent",
      notification_id: notification?.[0]?.id || null,
      sent_at: new Date(),
    })
    return new StepResponse({ skipped: false, sent: true, recovery_id: recovery.id })
  } catch (error) {
    const retryMinutes = Math.min(24 * 60, 30 * 2 ** Math.min(attemptCount - 1, 5))
    await service.updateCartRecoveries({ id: recovery.id, send_count: attemptCount })
    await service.updateCartRecoveryLogs({
      id: log.id,
      status: "failed",
      error_message: error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000),
      next_retry_at: new Date(Date.now() + retryMinutes * 60_000),
    })
    throw error
  }
})

export const sendCartRecoveryWorkflow = createWorkflow(
  "send-cart-recovery",
  (input: { recovery_id: string }) => {
    const result = sendCartRecoveryStep(input)
    return new WorkflowResponse(result)
  }
)
