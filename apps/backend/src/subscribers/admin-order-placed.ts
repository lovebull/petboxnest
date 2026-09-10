import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { sendAdminOrderNotificationWorkflow } from "../workflows/send-admin-order-notification"

export default async function adminOrderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const recipients = (process.env.ADMIN_NOTIFICATION_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  if (!recipients.length) {
    logger.warn("Admin order notification skipped because ADMIN_NOTIFICATION_EMAIL is not configured.")
    return
  }

  const protocol = process.env.PUBLIC_PROTOCOL || "http"
  const host = process.env.PUBLIC_HOST || "127.0.0.1"
  const backendUrl = (
    process.env.MEDUSA_BACKEND_URL || `${protocol}://${host}:7020`
  )
    .replaceAll("$PUBLIC_PROTOCOL", protocol)
    .replaceAll("${PUBLIC_PROTOCOL}", protocol)
    .replaceAll("$PUBLIC_HOST", host)
    .replaceAll("${PUBLIC_HOST}", host)
    .replace(/\/$/, "")

  for (const to of recipients) {
    await sendAdminOrderNotificationWorkflow(container).run({
      input: {
        id: data.id,
        to,
        admin_url: `${backendUrl}/app/orders/${encodeURIComponent(data.id)}`,
      },
    })
  }
}

export const config: SubscriberConfig = { event: "order.placed" }
