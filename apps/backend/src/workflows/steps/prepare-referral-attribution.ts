import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type {
  ReferralAttributionRecord,
  ReferralParticipantRecord,
  ReferralProgramRecord,
} from "../../modules/referral/types"

type BindReferralInput = {
  cart_id: string
  code: string
  customer_id?: string | null
}

type CartForReferral = {
  id: string
  customer_id?: string | null
  metadata?: Record<string, unknown> | null
}

type CompensationData = {
  created_id?: string
  previous?: ReferralAttributionRecord
}

export const prepareReferralAttributionStep = createStep<
  BindReferralInput,
  {
    attribution: ReferralAttributionRecord
    cart_metadata: Record<string, unknown>
    promotion_code: string
    should_apply_discount: boolean
  },
  CompensationData | null
>(
  "prepare-referral-attribution",
  async (input, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const [program] = (await referralService.listReferralPrograms({
      key: "default",
      is_active: true,
    })) as ReferralProgramRecord[]

    if (!program) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "The referral program is not active."
      )
    }

    const normalizedCode = input.code.trim().toUpperCase()
    const [participant] = (await referralService.listReferralParticipants({
      code: normalizedCode,
      is_active: true,
    })) as ReferralParticipantRecord[]

    if (!participant) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Referral code not found.")
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "customer_id", "metadata"],
      filters: { id: input.cart_id },
    })
    const cart = carts[0] as unknown as CartForReferral | undefined

    if (!cart) {
      throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found.")
    }

    const customerId = input.customer_id || cart.customer_id || null
    if (customerId && customerId === participant.customer_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "You cannot use your own referral code."
      )
    }

    const [existing] = (await referralService.listReferralAttributions({
      cart_id: cart.id,
    })) as ReferralAttributionRecord[]
    const now = new Date()
    let attribution: ReferralAttributionRecord
    let compensation: CompensationData | null = null

    if (
      existing &&
      existing.status === "active" &&
      new Date(existing.expires_at) > now
    ) {
      attribution = existing
    } else {
      const expiresAt = new Date(now)
      expiresAt.setUTCDate(expiresAt.getUTCDate() + program.attribution_days)
      const data = {
        participant_id: participant.id,
        referrer_customer_id: participant.customer_id,
        referred_customer_id: customerId,
        cart_id: cart.id,
        code: participant.code,
        status: "active" as const,
        expires_at: expiresAt,
        converted_at: null,
        rejection_reason: null,
      }

      if (existing) {
        attribution = (await referralService.updateReferralAttributions({
          id: existing.id,
          ...data,
        })) as unknown as ReferralAttributionRecord
        compensation = { previous: existing }
      } else {
        attribution = (await referralService.createReferralAttributions(
          data
        )) as unknown as ReferralAttributionRecord
        compensation = { created_id: attribution.id }
      }
    }

    let hasPriorOrders = false
    if (customerId) {
      const { data: customers } = await query.graph({
        entity: "customer",
        fields: ["id", "has_account", "orders.id"],
        filters: { id: customerId },
      })
      const customer = customers[0] as
        | { has_account?: boolean; orders?: Array<{ id: string }> }
        | undefined
      hasPriorOrders = !customer?.has_account || Boolean(customer.orders?.length)
    }

    return new StepResponse(
      {
        attribution,
        cart_metadata: {
          ...(cart.metadata || {}),
          referral_attribution_id: attribution.id,
          referral_code: attribution.code,
          referral_cart_id: cart.id,
        },
        promotion_code: program.promotion_code,
        should_apply_discount: Boolean(customerId && !hasPriorOrders),
      },
      compensation
    )
  },
  async (compensation, { container }) => {
    if (!compensation) {
      return
    }
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    if (compensation.created_id) {
      await referralService.deleteReferralAttributions(compensation.created_id)
    } else if (compensation.previous) {
      await referralService.updateReferralAttributions({
        ...compensation.previous,
        expires_at: new Date(compensation.previous.expires_at),
        converted_at: compensation.previous.converted_at
          ? new Date(compensation.previous.converted_at)
          : null,
      })
    }
  }
)
