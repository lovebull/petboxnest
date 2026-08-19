import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import type { UpdateReferralSettingsSchema } from "../../../middlewares"
import { REFERRAL_MODULE } from "../../../../modules/referral"
import type ReferralModuleService from "../../../../modules/referral/service"
import type { ReferralProgramRecord } from "../../../../modules/referral/types"
import { upsertReferralProgramWorkflow } from "../../../../workflows/upsert-referral-program"

const defaultSettings = {
  name: "Customer referral program",
  is_active: false,
  commission_percentage: 8,
  referee_discount_percentage: 10,
  promotion_code: "REFERRED10",
  currency_code: "usd",
  minimum_order_amount: 80,
  maximum_commission_amount: 30,
  waiting_days: 30,
  attribution_days: 30,
  stack_with_cashback: false,
}

const toEditableSettings = (program: ReferralProgramRecord) => ({
  name: program.name,
  is_active: program.is_active,
  commission_percentage: Number(program.commission_percentage),
  referee_discount_percentage: Number(program.referee_discount_percentage),
  promotion_code: program.promotion_code,
  currency_code: program.currency_code,
  minimum_order_amount: Number(program.minimum_order_amount),
  maximum_commission_amount:
    program.maximum_commission_amount === null
      ? null
      : Number(program.maximum_commission_amount),
  waiting_days: program.waiting_days,
  attribution_days: program.attribution_days,
  stack_with_cashback: program.stack_with_cashback,
})

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const service = req.scope.resolve<ReferralModuleService>(REFERRAL_MODULE)
  const [program] = (await service.listReferralPrograms({
    key: "default",
  })) as ReferralProgramRecord[]
  res.json({
    referral_program: program ? toEditableSettings(program) : defaultSettings,
  })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateReferralSettingsSchema>,
  res: MedusaResponse
) {
  const { result } = await upsertReferralProgramWorkflow(req.scope).run({
    input: req.validatedBody,
  })
  res.json({ referral_program: result })
}
