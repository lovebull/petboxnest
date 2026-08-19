import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { bindReferralToCartWorkflow } from "../workflows/bind-referral-to-cart"

export default async function referralCartCustomerTransferredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "customer_id", "metadata"],
    filters: { id: data.id },
  })
  const cart = carts[0] as
    | {
        id: string
        customer_id?: string | null
        metadata?: Record<string, unknown> | null
      }
    | undefined
  const code = cart?.metadata?.referral_code
  if (!cart || typeof code !== "string") {
    return
  }

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await bindReferralToCartWorkflow(container).run({
      input: {
        cart_id: cart.id,
        code,
        customer_id: cart.customer_id,
      },
    })
  } catch (error) {
    logger.error(
      `Failed to refresh referral attribution for cart ${cart.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = { event: "cart.customer_transferred" }
