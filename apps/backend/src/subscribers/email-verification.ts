import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"

type VerificationRequestedEvent = {
  entity_id: string
  entity_type: string
  code_provider: string
  auth_identity_id: string
  code: string
  expires_at: string
  metadata?: Record<string, unknown>
}

const normalizeCountryCode = (value: unknown) => {
  if (typeof value !== "string") {
    return "us"
  }

  const countryCode = value.trim().toLowerCase()
  return /^[a-z]{2}$/.test(countryCode) ? countryCode : "us"
}

export default async function verificationRequestedHandler({
  event: { data },
  container,
}: SubscriberArgs<VerificationRequestedEvent>) {
  if (data.entity_type !== "email") {
    return
  }

  const notificationService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const storefrontUrl = (
    process.env.STOREFRONT_URL || "http://127.0.0.1:7000"
  ).replace(/\/$/, "")
  const countryCode = normalizeCountryCode(data.metadata?.country_code)
  const verificationUrl = `${storefrontUrl}/${countryCode}/verify-account?token=${encodeURIComponent(data.code)}`

  const notifications = await notificationService.createNotifications({
    to: data.entity_id,
    channel: "email",
    template: "email-verification",
    data: {
      verification_url: verificationUrl,
    },
  })
  const notification = Array.isArray(notifications)
    ? notifications[0]
    : notifications
  const messageId = (
    notification as { external_id?: string | null } | undefined
  )?.external_id

  if (!messageId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Email verification notification for ${data.entity_id} did not return a Resend Message ID.`
    )
  }

  logger.info(
    `Email verification sent to ${data.entity_id}; Resend Message ID: ${messageId}`
  )
}

export const config: SubscriberConfig = {
  event: "auth.verification_requested",
}
