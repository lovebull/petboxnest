import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

import { REFERRAL_MODULE } from "../../../../modules/referral"
import type ReferralModuleService from "../../../../modules/referral/service"
import type {
  ReferralParticipantRecord,
  ReferralProgramRecord,
} from "../../../../modules/referral/types"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service = req.scope.resolve<ReferralModuleService>(REFERRAL_MODULE)
  const code = req.params.code.trim().toUpperCase()
  const [participant] = (await service.listReferralParticipants({
    code,
    is_active: true,
  })) as ReferralParticipantRecord[]
  const [program] = (await service.listReferralPrograms({
    key: "default",
    is_active: true,
  })) as ReferralProgramRecord[]

  res.json({
    valid: Boolean(participant && program),
    referral: participant && program
      ? {
          code: participant.code,
          discount_percentage: Number(program.referee_discount_percentage),
          attribution_days: program.attribution_days,
        }
      : null,
  })
}
