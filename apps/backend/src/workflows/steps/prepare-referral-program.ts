import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type { ReferralProgramRecord } from "../../modules/referral/types"

export type ReferralProgramInput = {
  name: string
  is_active: boolean
  commission_percentage: number
  referee_discount_percentage: number
  promotion_code: string
  currency_code: string
  minimum_order_amount: number
  maximum_commission_amount: number | null
  waiting_days: number
  attribution_days: number
  stack_with_cashback: boolean
}

export type PreparedReferralProgram = {
  settings: ReferralProgramInput
  existing_program: ReferralProgramRecord | null
  promotion_id: string | null
}

export const prepareReferralProgramStep = createStep(
  "prepare-referral-program",
  async (input: ReferralProgramInput, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const [existingProgram] = (await referralService.listReferralPrograms({
      key: "default",
    })) as ReferralProgramRecord[]

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: promotions } = await query.graph({
      entity: "promotion",
      fields: ["id", "code"],
      filters: existingProgram?.promotion_id
        ? { id: existingProgram.promotion_id }
        : { code: input.promotion_code },
    })

    return new StepResponse<PreparedReferralProgram>({
      settings: {
        ...input,
        promotion_code: input.promotion_code.trim().toUpperCase(),
        currency_code: input.currency_code.toLowerCase(),
      },
      existing_program: existingProgram || null,
      promotion_id: (promotions[0]?.id as string | undefined) || null,
    })
  }
)
