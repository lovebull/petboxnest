import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

import {
  type UpdateCashbackSettingsSchema,
} from "../../../middlewares"
import { CASHBACK_MODULE } from "../../../../modules/cashback"
import type CashbackModuleService from "../../../../modules/cashback/service"
import type { CashbackRuleRecord } from "../../../../modules/cashback/types"
import { upsertCashbackRuleWorkflow } from "../../../../workflows/upsert-cashback-rule"

const defaultSettings = {
  key: "default",
  name: "Default cashback",
  is_active: false,
  reward_type: "percentage" as const,
  reward_value: 5,
  currency_code: "usd",
  minimum_order_amount: 0,
  maximum_cashback_amount: null,
  waiting_days: 30,
  starts_at: null,
  ends_at: null,
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cashbackService = req.scope.resolve<CashbackModuleService>(
    CASHBACK_MODULE
  )
  const [rule] = (await cashbackService.listCashbackRules({
    key: "default",
  })) as CashbackRuleRecord[]

  res.json({ cashback_rule: rule || defaultSettings })
}

export async function POST(
  req: AuthenticatedMedusaRequest<UpdateCashbackSettingsSchema>,
  res: MedusaResponse
) {
  const { result } = await upsertCashbackRuleWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({ cashback_rule: result })
}
