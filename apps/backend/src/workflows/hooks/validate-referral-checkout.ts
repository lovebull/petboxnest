import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { completeCartWorkflow } from "@medusajs/medusa/core-flows"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type {
  ReferralAttributionRecord,
  ReferralProgramRecord,
} from "../../modules/referral/types"

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const attributionId = cart.metadata?.referral_attribution_id
  if (typeof attributionId !== "string") {
    return
  }
  if (!cart.customer_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Sign in or create an account to use a referral offer."
    )
  }

  const referralService = container.resolve<ReferralModuleService>(
    REFERRAL_MODULE
  )
  const [attribution] = (await referralService.listReferralAttributions({
    id: attributionId,
    status: "active",
  })) as ReferralAttributionRecord[]
  const [program] = (await referralService.listReferralPrograms({
    key: "default",
    is_active: true,
  })) as ReferralProgramRecord[]
  if (
    !attribution ||
    !program ||
    attribution.cart_id !== cart.id ||
    new Date(attribution.expires_at) <= new Date() ||
    attribution.referrer_customer_id === cart.customer_id
  ) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This referral offer is no longer valid."
    )
  }
  const hasReferralPromotion = cart.promotions?.some(
    (promotion: { code?: string }) => promotion.code === program.promotion_code
  )
  if (!hasReferralPromotion) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "The referral discount could not be applied. Refresh the cart and try again."
    )
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "has_account", "orders.id"],
    filters: { id: cart.customer_id },
  })
  const customer = customers[0] as
    | { has_account?: boolean; orders?: Array<{ id: string }> }
    | undefined
  if (!customer?.has_account || customer.orders?.length) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "The referral discount is only available on a customer's first order."
    )
  }
})
