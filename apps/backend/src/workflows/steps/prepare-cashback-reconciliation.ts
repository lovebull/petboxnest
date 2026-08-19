import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { CASHBACK_MODULE } from "../../modules/cashback"
import type CashbackModuleService from "../../modules/cashback/service"
import type {
  CashbackEntryRecord,
  CashbackRuleSnapshot,
} from "../../modules/cashback/types"
import { calculateCashback } from "../../modules/cashback/utils/calculate-cashback"

export type CashbackReconciliationAction =
  | "none"
  | "cancel"
  | "release"
  | "reverse"
  | "record_reversal_due"

export type CashbackReconciliationData = {
  action: CashbackReconciliationAction
  entry: CashbackEntryRecord
  eligible_amount: number
  target_amount: number
  account_id: string | null
  release_amount: number
  reverse_amount: number
  reversal_due: number
}

type OrderForReconciliation = {
  id: string
  status: string
  payment_status?: string
  fulfillment_status?: string
  item_subtotal: number
  credit_line_total?: number
  summary?: {
    refunded_total?: number
  }
}

type StoreCreditAccount = {
  id: string
  balance: number
}

export const prepareCashbackReconciliationStep = createStep(
  "prepare-cashback-reconciliation",
  async ({ entry_id }: { entry_id: string }, { container }) => {
    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )
    const entry = (await cashbackService.retrieveCashbackEntry(
      entry_id
    )) as unknown as CashbackEntryRecord
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "status",
        "payment_status",
        "fulfillment_status",
        "item_subtotal",
        "credit_line_total",
        "summary.refunded_total",
      ],
      filters: { id: entry.order_id },
    })
    const order = orders[0] as OrderForReconciliation | undefined

    if (!order) {
      return new StepResponse<CashbackReconciliationData>({
        action: "cancel",
        entry,
        eligible_amount: 0,
        target_amount: 0,
        account_id: entry.store_credit_account_id,
        release_amount: 0,
        reverse_amount: 0,
        reversal_due: 0,
      })
    }

    const refundedTotal = Number(order.summary?.refunded_total || 0)
    const eligibleAmount = Math.max(
      0,
      Number(order.item_subtotal) -
        Number(order.credit_line_total || 0) -
        refundedTotal
    )
    const targetAmount = calculateCashback(
      eligibleAmount,
      entry.rule_snapshot as CashbackRuleSnapshot
    )

    const { data: accounts } = await query.graph({
      entity: "store_credit_account",
      fields: ["id", "balance"],
      filters: {
        customer_id: entry.customer_id,
        currency_code: entry.currency_code,
      },
    })
    const account = accounts[0] as unknown as StoreCreditAccount | undefined

    if (entry.status === "pending") {
      if (order.status === "canceled" || targetAmount <= 0) {
        return new StepResponse<CashbackReconciliationData>({
          action: "cancel",
          entry,
          eligible_amount: eligibleAmount,
          target_amount: 0,
          account_id: account?.id || null,
          release_amount: 0,
          reverse_amount: 0,
          reversal_due: 0,
        })
      }

      const isDue = new Date(entry.available_at) <= new Date()
      const isPaid = ["captured", "partially_refunded"].includes(
        order.payment_status || ""
      )
      const isCompleted = order.status === "completed"

      if (isDue && isPaid && isCompleted) {
        return new StepResponse<CashbackReconciliationData>({
          action: "release",
          entry,
          eligible_amount: eligibleAmount,
          target_amount: targetAmount,
          account_id: account?.id || null,
          release_amount: targetAmount,
          reverse_amount: 0,
          reversal_due: 0,
        })
      }

      return new StepResponse<CashbackReconciliationData>({
        action: "none",
        entry,
        eligible_amount: eligibleAmount,
        target_amount: targetAmount,
        account_id: account?.id || null,
        release_amount: 0,
        reverse_amount: 0,
        reversal_due: 0,
      })
    }

    if (["available", "partially_reversed"].includes(entry.status)) {
      const currentNet =
        Number(entry.credited_amount) - Number(entry.reversed_amount)
      const amountToReverse = Math.max(0, currentNet - targetAmount)

      if (amountToReverse > 0) {
        const reverseAmount = Math.min(
          amountToReverse,
          Number(account?.balance || 0)
        )

        return new StepResponse<CashbackReconciliationData>({
          action:
            reverseAmount > 0 ? "reverse" : "record_reversal_due",
          entry,
          eligible_amount: eligibleAmount,
          target_amount: targetAmount,
          account_id: account?.id || entry.store_credit_account_id,
          release_amount: 0,
          reverse_amount: reverseAmount,
          reversal_due: amountToReverse - reverseAmount,
        })
      }
    }

    return new StepResponse<CashbackReconciliationData>({
      action: "none",
      entry,
      eligible_amount: eligibleAmount,
      target_amount: targetAmount,
      account_id: account?.id || entry.store_credit_account_id,
      release_amount: 0,
      reverse_amount: 0,
      reversal_due: Number(entry.reversal_due),
    })
  }
)
