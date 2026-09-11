import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

type StorefrontRevalidateResponse = {
  revalidated?: boolean
  tags?: string[]
  paths?: string[]
  message?: string
}

const getStorefrontRevalidateUrl = () => {
  const explicitUrl = process.env.STOREFRONT_REVALIDATE_URL

  if (explicitUrl) {
    return explicitUrl
  }

  const storefrontUrl =
    process.env.STOREFRONT_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://127.0.0.1:7000"

  return `${storefrontUrl.replace(/\/$/, "")}/api/revalidate`
}

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const secret = process.env.REVALIDATE_SECRET

  if (!secret) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "REVALIDATE_SECRET is not configured."
    )
  }

  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const revalidateUrl = getStorefrontRevalidateUrl()

  const response = await fetch(revalidateUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
    },
  })

  const result = (await response.json().catch(() => ({}))) as
    | StorefrontRevalidateResponse
    | Record<string, never>

  if (!response.ok) {
    logger.error(
      `Storefront cache clear failed with status ${response.status}: ${JSON.stringify(
        result
      )}`
    )

    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Failed to clear storefront cache."
    )
  }

  logger.info(`Storefront cache cleared by admin user ${req.auth_context.actor_id}`)

  res.status(200).json({
    success: true,
    storefront: result,
  })
}
