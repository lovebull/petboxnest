import { ContainerRegistrationKeys, getVariantAvailability, MedusaError, Modules } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { RESTOCK_MODULE } from "../../modules/restock"
import type RestockModuleService from "../../modules/restock/service"
import { createOpaqueToken, hashAutomationToken } from "../../utils/commerce-automation-token"

const sendRestockStep = createStep("send-restock", async (
  input: { subscription_id: string },
  { container }
) => {
  const service = container.resolve<RestockModuleService>(RESTOCK_MODULE)
  const [subscription] = await service.listRestockSubscriptions({ id: input.subscription_id })
  if (!subscription || subscription.status === "unsubscribed") return new StepResponse({ skipped: true, sent: false, subscription_id: input.subscription_id })
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const availability = await getVariantAvailability(query, {
    variant_ids: [subscription.variant_id],
    sales_channel_id: subscription.sales_channel_id,
  })
  if ((availability[subscription.variant_id]?.availability || 0) <= 0) {
    return new StepResponse({ skipped: true, sent: false, subscription_id: subscription.id })
  }
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "title", "product.title", "product.handle", "product.thumbnail"],
    filters: { id: subscription.variant_id },
  })
  const variant = variants[0] as any
  if (!variant?.product) return new StepResponse({ skipped: true, sent: false, subscription_id: subscription.id })
  const attemptCount = ((await service.listRestockNotificationLogs(
    { subscription_id: subscription.id }, { order: { created_at: "DESC" }, take: 1 }
  ))[0]?.attempt_count || 0) + 1
  const log = await service.createRestockNotificationLogs({
    subscription_id: subscription.id,
    status: "pending",
    attempt_count: attemptCount,
    notification_id: null,
    error_message: null,
    next_retry_at: null,
    triggered_at: new Date(),
    sent_at: null,
  })
  const unsubscribeToken = createOpaqueToken()
  const storefrontUrl = (process.env.STOREFRONT_URL || "http://localhost:7000").replace(/\/$/, "")
  const country = subscription.country_code || "us"
  try {
    const notification = await container.resolve(Modules.NOTIFICATION).createNotifications({
      to: subscription.email,
      channel: "email",
      template: "restock-available",
      trigger_type: "restock.available",
      resource_id: subscription.id,
      resource_type: "restock_subscription",
      data: {
        product_title: variant.product.title,
        variant_title: variant.title,
        thumbnail: variant.product.thumbnail,
        product_url: `${storefrontUrl}/${country}/products/${variant.product.handle}`,
        unsubscribe_url: `${storefrontUrl}/${country}/restock/unsubscribe?token=${unsubscribeToken}`,
      },
    })
    if (!notification?.[0] || notification[0].status === "failure") throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Notification provider reported a delivery failure")
    await service.updateRestockSubscriptions({
      id: subscription.id,
      status: "notified",
      last_notified_at: new Date(),
      unsubscribe_token_hash: hashAutomationToken(unsubscribeToken),
    })
    await service.updateRestockNotificationLogs({
      id: log.id,
      status: "sent",
      notification_id: notification?.[0]?.id || null,
      sent_at: new Date(),
    })
    return new StepResponse({ skipped: false, sent: true, subscription_id: subscription.id })
  } catch (error) {
    const retryMinutes = Math.min(24 * 60, 15 * 2 ** Math.min(attemptCount - 1, 6))
    await service.updateRestockNotificationLogs({
      id: log.id,
      status: "failed",
      error_message: error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000),
      next_retry_at: new Date(Date.now() + retryMinutes * 60_000),
    })
    throw error
  }
})

export const sendRestockNotificationWorkflow = createWorkflow(
  "send-restock-notification",
  (input: { subscription_id: string }) => {
    const result = sendRestockStep(input)
    return new WorkflowResponse(result)
  }
)
