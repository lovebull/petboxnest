import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { CASHBACK_MODULE } from "../../modules/cashback"
import type CashbackModuleService from "../../modules/cashback/service"
import type { CashbackRewardType, CashbackRuleRecord } from "../../modules/cashback/types"

export type UpsertCashbackRuleInput = {
  name: string
  is_active: boolean
  reward_type: CashbackRewardType
  reward_value: number
  currency_code: string
  minimum_order_amount: number
  maximum_cashback_amount: number | null
  waiting_days: number
  starts_at: string | null
  ends_at: string | null
}

type CompensationInput = {
  created_id?: string
  previous?: CashbackRuleRecord
}

export const upsertCashbackRuleStep = createStep(
  "upsert-cashback-rule",
  async (input: UpsertCashbackRuleInput, { container }) => {
    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )
    const [existing] = (await cashbackService.listCashbackRules({
      key: "default",
    })) as CashbackRuleRecord[]

    const data = {
      key: "default",
      name: input.name,
      is_active: input.is_active,
      reward_type: input.reward_type,
      reward_value: input.reward_value,
      currency_code: input.currency_code.toLowerCase(),
      minimum_order_amount: input.minimum_order_amount,
      maximum_cashback_amount: input.maximum_cashback_amount,
      waiting_days: input.waiting_days,
      starts_at: input.starts_at ? new Date(input.starts_at) : null,
      ends_at: input.ends_at ? new Date(input.ends_at) : null,
    }

    if (existing) {
      const updated = await cashbackService.updateCashbackRules({
        id: existing.id,
        ...data,
      })

      return new StepResponse(updated, { previous: existing })
    }

    const created = await cashbackService.createCashbackRules(data)

    return new StepResponse(created, { created_id: created.id })
  },
  async (compensationInput: CompensationInput | undefined, { container }) => {
    if (!compensationInput) {
      return
    }

    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )

    if (compensationInput.created_id) {
      await cashbackService.deleteCashbackRules(compensationInput.created_id)
      return
    }

    if (compensationInput.previous) {
      const previous = compensationInput.previous
      await cashbackService.updateCashbackRules({
        id: previous.id,
        name: previous.name,
        is_active: previous.is_active,
        reward_type: previous.reward_type,
        reward_value: Number(previous.reward_value),
        currency_code: previous.currency_code,
        minimum_order_amount: Number(previous.minimum_order_amount),
        maximum_cashback_amount:
          previous.maximum_cashback_amount === null
            ? null
            : Number(previous.maximum_cashback_amount),
        waiting_days: previous.waiting_days,
        starts_at: previous.starts_at ? new Date(previous.starts_at) : null,
        ends_at: previous.ends_at ? new Date(previous.ends_at) : null,
      })
    }
  }
)
