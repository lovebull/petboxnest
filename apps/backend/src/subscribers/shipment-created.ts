import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

import { sendShipmentNotificationWorkflow } from "../workflows/send-shipment-notification"

type ShipmentCreatedEvent = { id: string; no_notification?: boolean }

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<ShipmentCreatedEvent>) {
  await sendShipmentNotificationWorkflow(container).run({ input: data })
}

export const config: SubscriberConfig = { event: "shipment.created" }
