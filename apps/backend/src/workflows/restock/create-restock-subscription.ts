import { ContainerRegistrationKeys, getVariantAvailability, MedusaError } from "@medusajs/framework/utils"
import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { createHash } from "node:crypto"
import { RESTOCK_MODULE } from "../../modules/restock"
import type RestockModuleService from "../../modules/restock/service"
import { createOpaqueToken, hashAutomationToken } from "../../utils/commerce-automation-token"

export type CreateRestockSubscriptionInput = {
  variant_id: string
  sales_channel_id: string
  email: string
  customer_id?: string | null
  country_code?: string | null
  consent: boolean
  consent_source: string
}

const createSubscriptionStep = createStep(
  "create-subscription",
  async (input: CreateRestockSubscriptionInput, { container }) => {
    if (!input.consent) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Consent is required")
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: variants } = await query.graph({ entity: "variant", fields: ["id"], filters: { id: input.variant_id } })
    if (!variants.length) throw new MedusaError(MedusaError.Types.NOT_FOUND, "Product variant not found")
    const availability = await getVariantAvailability(query, {
      variant_ids: [input.variant_id],
      sales_channel_id: input.sales_channel_id,
    })
    if ((availability[input.variant_id]?.availability || 0) > 0) {
      throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This product is already available")
    }

    const service = container.resolve<RestockModuleService>(RESTOCK_MODULE)
    const email = input.email.trim().toLowerCase()
    const subscriptionKey = createHash("sha256")
      .update(`${email}:${input.variant_id}:${input.sales_channel_id}`)
      .digest("hex")
    const [existing] = await service.listRestockSubscriptions({ subscription_key: subscriptionKey })
    if (existing) {
      const updated = await service.updateRestockSubscriptions({
        id: existing.id,
        email,
        customer_id: input.customer_id || null,
        country_code: input.country_code?.toLowerCase() || null,
        status: "active",
        consent_given: true,
        consented_at: new Date(),
        consent_source: input.consent_source,
        unsubscribed_at: null,
      })
      return new StepResponse(updated)
    }
    const unsubscribeToken = createOpaqueToken()
    const subscription = await service.createRestockSubscriptions({
      subscription_key: subscriptionKey,
      variant_id: input.variant_id,
      sales_channel_id: input.sales_channel_id,
      email,
      customer_id: input.customer_id || null,
      country_code: input.country_code?.toLowerCase() || null,
      status: "active",
      consent_given: true,
      consented_at: new Date(),
      consent_source: input.consent_source,
      unsubscribe_token_hash: hashAutomationToken(unsubscribeToken),
      last_notified_at: null,
      unsubscribed_at: null,
    })
    return new StepResponse(subscription)
  }
)

export const createRestockSubscriptionWorkflow = createWorkflow(
  "create-restock-subscription",
  (input: CreateRestockSubscriptionInput) => {
    const result = createSubscriptionStep(input)
    return new WorkflowResponse(result)
  }
)
