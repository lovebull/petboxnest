import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { ensureReferralParticipantWorkflow } from "../workflows/ensure-referral-participant"

export default async function referralCustomerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    await ensureReferralParticipantWorkflow(container).run({
      input: { customer_id: data.id },
    })
  } catch (error) {
    logger.error(
      `Failed to activate referral participant for customer ${data.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = { event: "customer.created" }
