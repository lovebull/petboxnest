import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createRestockSubscriptionWorkflow } from "../../../workflows/restock/create-restock-subscription"

type Body = { variant_id: string; email: string; consent: boolean; consent_source?: string; country_code?: string }

export async function POST(req: MedusaRequest<Body>, res: MedusaResponse) {
  const salesChannels = (req as any).publishable_key_context?.sales_channel_ids as string[] | undefined
  const salesChannelId = salesChannels?.[0]
  if (!salesChannelId) return res.status(400).json({ message: "No sales channel is available for this storefront" })
  const auth = (req as any).auth_context
  const { result } = await createRestockSubscriptionWorkflow(req.scope).run({
    input: {
      ...req.validatedBody,
      sales_channel_id: salesChannelId,
      customer_id: auth?.actor_type === "customer" ? auth.actor_id : null,
      consent_source: req.validatedBody.consent_source || "product_page",
    },
  })
  res.status(201).json({ subscription: result })
}
