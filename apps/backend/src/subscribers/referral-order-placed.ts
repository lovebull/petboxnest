import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { createReferralConversionWorkflow } from "../workflows/create-referral-conversion"

export default async function referralOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await createReferralConversionWorkflow(container).run({
      input: { order_id: data.id },
    })
  } catch (error) {
    logger.error(
      `Failed to create referral conversion for order ${data.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = { event: "order.placed" }
