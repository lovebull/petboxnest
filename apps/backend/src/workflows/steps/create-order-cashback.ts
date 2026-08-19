import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { CASHBACK_MODULE } from "../../modules/cashback"
import type CashbackModuleService from "../../modules/cashback/service"
import type {
  CashbackEntryRecord,
  CashbackRuleRecord,
  CashbackRuleSnapshot,
} from "../../modules/cashback/types"
import { calculateCashback } from "../../modules/cashback/utils/calculate-cashback"
import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type { ReferralProgramRecord } from "../../modules/referral/types"

type CreateOrderCashbackInput = {
  order_id: string
}

type OrderForCashback = {
  id: string
  display_id: string
  customer_id?: string | null
  currency_code: string
  item_subtotal: number
  credit_line_total?: number
  metadata?: Record<string, unknown> | null
  created_at: string | Date
}

const toSnapshot = (rule: CashbackRuleRecord): CashbackRuleSnapshot => ({
  name: rule.name,
  reward_type: rule.reward_type,
  reward_value: Number(rule.reward_value),
  currency_code: rule.currency_code,
  minimum_order_amount: Number(rule.minimum_order_amount),
  maximum_cashback_amount:
    rule.maximum_cashback_amount === null
      ? null
      : Number(rule.maximum_cashback_amount),
  waiting_days: rule.waiting_days,
})

export const createOrderCashbackStep = createStep<
  CreateOrderCashbackInput,
  CashbackEntryRecord | null,
  string | null
>(
  "create-order-cashback",
  async ({ order_id }: CreateOrderCashbackInput, { container }) => {
    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )
    const [existing] = (await cashbackService.listCashbackEntries({
      order_id,
    })) as unknown as CashbackEntryRecord[]

    if (existing) {
      return new StepResponse(existing, null)
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "customer_id",
        "currency_code",
        "item_subtotal",
        "credit_line_total",
        "metadata",
        "created_at",
      ],
      filters: { id: order_id },
    })
    const order = orders[0] as unknown as OrderForCashback | undefined

    if (!order?.customer_id) {
      return new StepResponse(null, null)
    }

    if (typeof order.metadata?.referral_attribution_id === "string") {
      const referralService = container.resolve<ReferralModuleService>(
        REFERRAL_MODULE
      )
      const [program] = (await referralService.listReferralPrograms({
        key: "default",
      })) as ReferralProgramRecord[]

      if (program && !program.stack_with_cashback) {
        return new StepResponse(null, null)
      }
    }

    const [rule] = (await cashbackService.listCashbackRules(
      {
        key: "default",
        is_active: true,
        currency_code: order.currency_code.toLowerCase(),
      },
      { order: { updated_at: "DESC" }, take: 1 }
    )) as CashbackRuleRecord[]

    if (!rule) {
      return new StepResponse(null, null)
    }

    const now = new Date()
    if (
      (rule.starts_at && new Date(rule.starts_at) > now) ||
      (rule.ends_at && new Date(rule.ends_at) < now)
    ) {
      return new StepResponse(null, null)
    }

    const snapshot = toSnapshot(rule)
    const eligibleAmount = Math.max(
      0,
      Number(order.item_subtotal) - Number(order.credit_line_total || 0)
    )
    const pendingAmount = calculateCashback(eligibleAmount, snapshot)

    if (pendingAmount <= 0) {
      return new StepResponse(null, null)
    }

    const availableAt = new Date(order.created_at)
    availableAt.setUTCDate(availableAt.getUTCDate() + snapshot.waiting_days)

    const entry = await cashbackService.createCashbackEntries({
      order_id: order.id,
      order_display_id: String(order.display_id),
      customer_id: order.customer_id,
      rule_id: rule.id,
      currency_code: order.currency_code.toLowerCase(),
      eligible_amount: eligibleAmount,
      pending_amount: pendingAmount,
      credited_amount: 0,
      reversed_amount: 0,
      reversal_due: 0,
      status: "pending",
      available_at: availableAt,
      rule_snapshot: snapshot,
    })

    return new StepResponse(
      entry as unknown as CashbackEntryRecord,
      entry.id
    )
  },
  async (entryId: string | null, { container }) => {
    if (!entryId) {
      return
    }

    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )
    await cashbackService.deleteCashbackEntries(entryId)
  }
)
