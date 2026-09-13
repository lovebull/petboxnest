import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CART_RECOVERY_MODULE } from "../modules/cart-recovery"
import type CartRecoveryModuleService from "../modules/cart-recovery/service"
import { createOpaqueToken, hashAutomationToken } from "../utils/commerce-automation-token"
import { sendCartRecoveryWorkflow } from "../workflows/cart-recovery/send-cart-recovery"

export default async function abandonedCartRecoveryJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<CartRecoveryModuleService>(CART_RECOVERY_MODULE)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const cutoff = new Date(Date.now() - 60 * 60 * 1000)
  const oldest = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "email", "metadata", "completed_at", "updated_at", "shipping_address.country_code", "items.id"],
    filters: { completed_at: null, updated_at: { $lt: cutoff, $gt: oldest } } as any,
    pagination: { take: 500, order: { updated_at: "ASC" } },
  })
  let sent = 0
  for (const cart of carts as any[]) {
    const metadata = (cart.metadata || {}) as Record<string, unknown>
    if (!cart.email || !cart.items?.length || metadata.abandoned_cart_consent !== true) continue
    try {
      let [recovery] = await service.listCartRecoveries({ cart_id: cart.id })
      if (["recovered", "unsubscribed", "expired", "sent"].includes(recovery?.status)) continue
      if (recovery) {
        const [lastLog] = await service.listCartRecoveryLogs({ recovery_id: recovery.id }, { take: 1, order: { created_at: "DESC" } })
        if (recovery.send_count >= 3 || (lastLog?.next_retry_at && new Date(lastLog.next_retry_at) > new Date())) continue
      } else {
        const placeholderToken = createOpaqueToken()
        recovery = await service.createCartRecoveries({
          cart_id: cart.id,
          email: String(cart.email).trim().toLowerCase(),
          status: "eligible",
          token_hash: hashAutomationToken(placeholderToken),
          token_expires_at: new Date(),
          unsubscribe_token_hash: hashAutomationToken(createOpaqueToken()),
          consent_given: true,
          consented_at: metadata.abandoned_cart_consented_at ? new Date(String(metadata.abandoned_cart_consented_at)) : new Date(),
          consent_source: String(metadata.abandoned_cart_consent_source || "checkout"),
          country_code: cart.shipping_address?.country_code || null,
          send_count: 0,
          last_sent_at: null,
          recovered_at: null,
          unsubscribed_at: null,
        })
      }
      const { result } = await sendCartRecoveryWorkflow(container).run({ input: { recovery_id: recovery.id } })
      if ((result as any).sent) sent++
    } catch (error) {
      logger.error(`Cart recovery failed for ${cart.id}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  logger.info(`Abandoned-cart scan processed ${carts.length} carts; ${sent} recovery messages sent.`)
}

export const config = { name: "petboxnest-abandoned-cart-recovery", schedule: "*/15 * * * *" }
