import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type { ReferralProgramRecord } from "../../modules/referral/types"
import type { PreparedReferralProgram } from "./prepare-referral-program"

type SaveReferralProgramInput = PreparedReferralProgram & {
  resolved_promotion_id: string
}

export const saveReferralProgramStep = createStep(
  "save-referral-program",
  async (input: SaveReferralProgramInput, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const data = {
      ...input.settings,
      key: "default",
      promotion_id: input.resolved_promotion_id,
    }
    const program = input.existing_program
      ? await referralService.updateReferralPrograms({
          id: input.existing_program.id,
          ...data,
        })
      : await referralService.createReferralPrograms(data)

    return new StepResponse(
      program as unknown as ReferralProgramRecord,
      input.existing_program
    )
  },
  async (previous: ReferralProgramRecord | null | undefined, { container }) => {
    if (!previous) {
      return
    }

    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    await referralService.updateReferralPrograms({
      ...previous,
      minimum_order_amount: Number(previous.minimum_order_amount),
      maximum_commission_amount:
        previous.maximum_commission_amount === null
          ? null
          : Number(previous.maximum_commission_amount),
    })
  }
)
