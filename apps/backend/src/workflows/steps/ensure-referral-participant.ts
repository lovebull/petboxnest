import { randomBytes } from "node:crypto"

import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type { ReferralParticipantRecord } from "../../modules/referral/types"

const createCode = () => randomBytes(5).toString("hex").toUpperCase()

export const ensureReferralParticipantStep = createStep<
  { customer_id: string },
  ReferralParticipantRecord,
  string | null
>(
  "ensure-referral-participant",
  async ({ customer_id }, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const [existing] = (await referralService.listReferralParticipants({
      customer_id,
    })) as ReferralParticipantRecord[]

    if (existing) {
      return new StepResponse(existing, null)
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = createCode()
      const [collision] = (await referralService.listReferralParticipants({
        code,
      })) as ReferralParticipantRecord[]

      if (!collision) {
        const participant = await referralService.createReferralParticipants({
          customer_id,
          code,
          is_active: true,
        })

        return new StepResponse(
          participant as unknown as ReferralParticipantRecord,
          participant.id
        )
      }
    }

    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Unable to generate a unique referral code."
    )
  },
  async (participantId, { container }) => {
    if (!participantId) {
      return
    }

    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    await referralService.deleteReferralParticipants(participantId)
  }
)
