import crypto from "node:crypto"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

type PasswordResetEvent = {
  entity_id: string
  token: string
  actor_type: string
  metadata?: Record<string, unknown>
}

const text = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : ""

const getCmsUrl = () => {
  if (process.env.PAYLOAD_CMS_URL) return process.env.PAYLOAD_CMS_URL.replace(/\/$/, "")
  return `${process.env.PUBLIC_PROTOCOL || "http"}://${process.env.PUBLIC_HOST || "127.0.0.1"}:7010`
}

export default async function passwordResetHandler({ event: { data }, container }: SubscriberArgs<PasswordResetEvent>) {
  if (data.actor_type !== "customer") return

  const notificationService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const countryCode = text(data.metadata?.country_code, 8).toLowerCase() || "us"
  const storefrontUrl = (process.env.STOREFRONT_URL || "http://127.0.0.1:7000").replace(/\/$/, "")
  const resetUrl = `${storefrontUrl}/${encodeURIComponent(countryCode)}/reset-password?token=${encodeURIComponent(data.token)}&email=${encodeURIComponent(data.entity_id)}`
  const notifications = await notificationService.createNotifications({
    to: data.entity_id,
    channel: "email",
    template: "password-reset",
    data: { reset_url: resetUrl },
  })
  const notification = Array.isArray(notifications) ? notifications[0] : notifications
  const resendMessageId = text(
    (notification as { external_id?: unknown } | undefined)?.external_id,
    200
  )
  const secret = process.env.PASSWORD_RESET_AUDIT_SECRET || process.env.REVALIDATE_SECRET

  if (!secret) {
    logger.error("Password reset audit was not recorded because its shared secret is not configured.")
    return
  }

  try {
    const response = await fetch(`${getCmsUrl()}/api/password-reset-requests/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-pbn-audit-secret": secret },
      body: JSON.stringify({
        requestId: text(data.metadata?.request_id, 80) || crypto.randomUUID(),
        username: data.entity_id,
        requestedAt: text(data.metadata?.requested_at, 64) || new Date().toISOString(),
        ipAddress: text(data.metadata?.ip_address, 128) || "unknown",
        browserFingerprint: text(data.metadata?.browser_fingerprint, 4000) || "unavailable",
        userAgent: text(data.metadata?.user_agent, 1000),
        deliveryStatus: resendMessageId ? "sent" : "failed",
        resendMessageId,
      }),
    })
    if (!response.ok) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `CMS returned HTTP ${response.status}`
      )
    }
  } catch (error) {
    logger.error(`Failed to record password reset audit: ${error instanceof Error ? error.message : "unknown error"}`)
  }
}

export const config: SubscriberConfig = { event: "auth.password_reset" }
