import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { CASHBACK_MODULE } from "../../modules/cashback"
import type CashbackModuleService from "../../modules/cashback/service"
import type { CashbackEntryRecord } from "../../modules/cashback/types"
import type { CashbackReconciliationData } from "./prepare-cashback-reconciliation"

type TransactionResult = {
  id: string
}

type FinalizeCashbackReconciliationInput = {
  prepared: CashbackReconciliationData
  account_id: string | null
  credit_transactions?: TransactionResult[]
  debit_transactions?: TransactionResult[]
}

export const finalizeCashbackReconciliationStep = createStep(
  "finalize-cashback-reconciliation",
  async (input: FinalizeCashbackReconciliationInput, { container }) => {
    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )
    const { prepared } = input
    const previous = prepared.entry
    const baseUpdate = {
      id: previous.id,
      eligible_amount: prepared.eligible_amount,
      pending_amount: prepared.target_amount,
    }

    let updated: CashbackEntryRecord

    switch (prepared.action) {
      case "cancel":
        updated = (await cashbackService.updateCashbackEntries({
          ...baseUpdate,
          status: "cancelled",
          pending_amount: 0,
          reversal_due: 0,
        })) as unknown as CashbackEntryRecord
        break
      case "release":
        updated = (await cashbackService.updateCashbackEntries({
          ...baseUpdate,
          status: "available",
          credited_amount: prepared.release_amount,
          reversal_due: 0,
          released_at: new Date(),
          store_credit_account_id: input.account_id,
          store_credit_transaction_id:
            input.credit_transactions?.[0]?.id || null,
        })) as unknown as CashbackEntryRecord
        break
      case "reverse": {
        const reversedAmount =
          Number(previous.reversed_amount) + prepared.reverse_amount
        const netAmount = Number(previous.credited_amount) - reversedAmount
        const fullyReversed =
          netAmount <= 0 && prepared.reversal_due <= 0

        updated = (await cashbackService.updateCashbackEntries({
          ...baseUpdate,
          status: fullyReversed ? "reversed" : "partially_reversed",
          reversed_amount: reversedAmount,
          reversal_due: prepared.reversal_due,
          reversal_transaction_id:
            input.debit_transactions?.[0]?.id ||
            previous.reversal_transaction_id,
        })) as unknown as CashbackEntryRecord
        break
      }
      case "record_reversal_due":
        updated = (await cashbackService.updateCashbackEntries({
          ...baseUpdate,
          status: "partially_reversed",
          reversal_due: prepared.reversal_due,
        })) as unknown as CashbackEntryRecord
        break
      default:
        updated = (await cashbackService.updateCashbackEntries({
          ...baseUpdate,
        })) as unknown as CashbackEntryRecord
    }

    return new StepResponse(updated, previous)
  },
  async (previous: CashbackEntryRecord | undefined, { container }) => {
    if (!previous) {
      return
    }

    const cashbackService = container.resolve<CashbackModuleService>(
      CASHBACK_MODULE
    )
    await cashbackService.updateCashbackEntries({
      id: previous.id,
      eligible_amount: Number(previous.eligible_amount),
      pending_amount: Number(previous.pending_amount),
      credited_amount: Number(previous.credited_amount),
      reversed_amount: Number(previous.reversed_amount),
      reversal_due: Number(previous.reversal_due),
      status: previous.status,
      released_at: previous.released_at ? new Date(previous.released_at) : null,
      store_credit_account_id: previous.store_credit_account_id,
      store_credit_transaction_id: previous.store_credit_transaction_id,
      reversal_transaction_id: previous.reversal_transaction_id,
    })
  }
)
