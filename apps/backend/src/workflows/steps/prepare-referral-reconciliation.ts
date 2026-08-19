import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type { ReferralConversionRecord } from "../../modules/referral/types"
import { calculateCommission } from "../../modules/referral/utils/calculate-commission"

export type ReferralReconciliationData = {
  action: "none" | "cancel" | "release" | "reverse" | "record_reversal_due"
  conversion: ReferralConversionRecord
  eligible_amount: number
  target_amount: number
  account_id: string | null
  release_amount: number
  reverse_amount: number
  reversal_due: number
  accrual_ledger_id: string | null
  clawback_offsets?: Array<{ conversion_id: string; amount: number }>
}

export const prepareReferralReconciliationStep = createStep(
  "prepare-referral-reconciliation",
  async ({ conversion_id }: { conversion_id: string }, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const conversion = (await referralService.retrieveReferralConversion(
      conversion_id
    )) as unknown as ReferralConversionRecord
    const [accrual] = await referralService.listCommissionLedgerEntries({
      idempotency_key: `${conversion.id}:accrual`,
    })
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "status",
        "payment_status",
        "item_subtotal",
        "credit_line_total",
        "summary.refunded_total",
      ],
      filters: { id: conversion.order_id },
    })
    const order = orders[0] as
      | {
          status: string
          payment_status?: string
          item_subtotal: number
          credit_line_total?: number
          summary?: { refunded_total?: number }
        }
      | undefined
    const { data: accounts } = await query.graph({
      entity: "store_credit_account",
      fields: ["id", "balance"],
      filters: {
        customer_id: conversion.referrer_customer_id,
        currency_code: conversion.currency_code,
      },
    })
    const account = accounts[0] as unknown as
      | { id: string; balance: number }
      | undefined
    const base = {
      conversion,
      account_id: account?.id || conversion.store_credit_account_id,
      accrual_ledger_id: (accrual?.id as string | undefined) || null,
    }

    if (!order) {
      return new StepResponse<ReferralReconciliationData>({
        ...base,
        action: "cancel",
        eligible_amount: 0,
        target_amount: 0,
        release_amount: 0,
        reverse_amount: 0,
        reversal_due: 0,
      })
    }

    const eligibleAmount = Math.max(
      0,
      Number(order.item_subtotal) -
        Number(order.credit_line_total || 0) -
        Number(order.summary?.refunded_total || 0)
    )
    const targetAmount = calculateCommission(eligibleAmount, conversion.rule_snapshot)

    if (conversion.status === "pending") {
      if (order.status === "canceled" || targetAmount <= 0) {
        return new StepResponse<ReferralReconciliationData>({
          ...base,
          action: "cancel",
          eligible_amount: eligibleAmount,
          target_amount: 0,
          release_amount: 0,
          reverse_amount: 0,
          reversal_due: 0,
        })
      }
      const isDue = new Date(conversion.available_at) <= new Date()
      const isPaid = ["captured", "partially_refunded"].includes(
        order.payment_status || ""
      )
      if (isDue && isPaid && order.status === "completed") {
        const debtConversions = (await referralService.listReferralConversions(
          {
            referrer_customer_id: conversion.referrer_customer_id,
            status: "partially_reversed",
          },
          { order: { created_at: "ASC" }, take: 500 }
        )) as unknown as ReferralConversionRecord[]
        let remainingCommission = targetAmount
        const clawbackOffsets: Array<{ conversion_id: string; amount: number }> = []
        for (const debt of debtConversions) {
          if (debt.id === conversion.id || remainingCommission <= 0) {
            continue
          }
          const amount = Math.min(Number(debt.reversal_due), remainingCommission)
          if (amount > 0) {
            clawbackOffsets.push({ conversion_id: debt.id, amount })
            remainingCommission -= amount
          }
        }
        return new StepResponse<ReferralReconciliationData>({
          ...base,
          action: "release",
          eligible_amount: eligibleAmount,
          target_amount: targetAmount,
          release_amount: remainingCommission,
          reverse_amount: 0,
          reversal_due: 0,
          clawback_offsets: clawbackOffsets,
        })
      }
    }

    if (["paid", "partially_reversed"].includes(conversion.status)) {
      const netPaid =
        Number(conversion.credited_amount) - Number(conversion.reversed_amount)
      const amountToReverse = Math.max(0, netPaid - targetAmount)
      if (amountToReverse > 0) {
        const reverseAmount = Math.min(amountToReverse, Number(account?.balance || 0))
        return new StepResponse<ReferralReconciliationData>({
          ...base,
          action: reverseAmount > 0 ? "reverse" : "record_reversal_due",
          eligible_amount: eligibleAmount,
          target_amount: targetAmount,
          release_amount: 0,
          reverse_amount: reverseAmount,
          reversal_due: amountToReverse - reverseAmount,
        })
      }
    }

    return new StepResponse<ReferralReconciliationData>({
      ...base,
      action: "none",
      eligible_amount: eligibleAmount,
      target_amount: targetAmount,
      release_amount: 0,
      reverse_amount: 0,
      reversal_due: Number(conversion.reversal_due),
    })
  }
)
