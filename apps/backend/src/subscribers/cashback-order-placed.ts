import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { createOrderCashbackWorkflow } from "../workflows/create-order-cashback"

export default async function cashbackOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  try {
    await createOrderCashbackWorkflow(container).run({
      input: { order_id: data.id },
    })
  } catch (error) {
    logger.error(
      `Failed to create cashback for order ${data.id}: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
