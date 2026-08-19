import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"

import { REFERRAL_MODULE } from "../../modules/referral"
import type ReferralModuleService from "../../modules/referral/service"
import type {
  CommissionLedgerEntryRecord,
  ReferralConversionRecord,
} from "../../modules/referral/types"
import type { ReferralReconciliationData } from "./prepare-referral-reconciliation"

type TransactionResult = { id: string }
type Input = {
  prepared: ReferralReconciliationData
  account_id: string | null
  credit_transactions?: TransactionResult[]
  debit_transactions?: TransactionResult[]
}
type Compensation = {
  conversion: ReferralConversionRecord
  accrual: CommissionLedgerEntryRecord | null
  created_ledger_id: string | null
}

export const finalizeReferralReconciliationStep = createStep<
  Input,
  ReferralConversionRecord,
  Compensation
>(
  "finalize-referral-reconciliation",
  async (input, { container }) => {
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    const { prepared } = input
    const previous = prepared.conversion
    const accrual = prepared.accrual_ledger_id
      ? ((await referralService.retrieveCommissionLedgerEntry(
          prepared.accrual_ledger_id
        )) as unknown as CommissionLedgerEntryRecord)
      : null
    let createdLedgerId: string | null = null
    const baseUpdate = {
      id: previous.id,
      eligible_amount: prepared.eligible_amount,
      commission_amount: prepared.target_amount,
    }
    let updated: ReferralConversionRecord

    if (prepared.action === "cancel") {
      updated = (await referralService.updateReferralConversions({
        ...baseUpdate,
        status: "cancelled",
        commission_amount: 0,
        reversal_due: 0,
      })) as unknown as ReferralConversionRecord
      if (accrual) {
        await referralService.updateCommissionLedgerEntries({
          id: accrual.id,
          status: "void",
          note: `Referral commission cancelled for order #${previous.order_display_id}`,
        })
      }
    } else if (prepared.action === "release") {
      const transactionId = input.credit_transactions?.[0]?.id || null
      for (const offset of prepared.clawback_offsets || []) {
        const clawbackKey = `${offset.conversion_id}:clawback:${previous.id}`
        const [existingClawback] = await referralService.listCommissionLedgerEntries({
          idempotency_key: clawbackKey,
        })
        if (existingClawback) {
          continue
        }
        const debt = (await referralService.retrieveReferralConversion(
          offset.conversion_id
        )) as unknown as ReferralConversionRecord
        const reversedAmount = Number(debt.reversed_amount) + offset.amount
        const reversalDue = Math.max(0, Number(debt.reversal_due) - offset.amount)
        const fullyReversed =
          Number(debt.credited_amount) - reversedAmount <= 0 && reversalDue <= 0
        await referralService.updateReferralConversions({
          id: debt.id,
          reversed_amount: reversedAmount,
          reversal_due: reversalDue,
          status: fullyReversed ? "reversed" : "partially_reversed",
        })
        await referralService.createCommissionLedgerEntries({
          conversion_id: debt.id,
          participant_id: debt.participant_id,
          customer_id: debt.referrer_customer_id,
          order_id: debt.order_id,
          entry_type: "reversal",
          status: "posted",
          amount: -offset.amount,
          currency_code: debt.currency_code,
          available_at: null,
          posted_at: new Date(),
          store_credit_transaction_id: null,
          idempotency_key: clawbackKey,
          note: `Clawback recovered from commission on order #${previous.order_display_id}`,
        })
      }
      updated = (await referralService.updateReferralConversions({
        ...baseUpdate,
        status: "paid",
        credited_amount: prepared.target_amount,
        reversal_due: 0,
        paid_at: new Date(),
        store_credit_account_id: input.account_id,
      })) as unknown as ReferralConversionRecord
      if (accrual) {
        await referralService.updateCommissionLedgerEntries({
          id: accrual.id,
          status: "posted",
          posted_at: new Date(),
          store_credit_transaction_id: transactionId,
          note:
            prepared.release_amount < prepared.target_amount
              ? `Referral commission settled with ${prepared.target_amount - prepared.release_amount} applied to an earlier clawback`
              : `Referral commission paid as store credit for order #${previous.order_display_id}`,
        })
      }
    } else if (prepared.action === "reverse") {
      const totalReversed =
        Number(previous.reversed_amount) + prepared.reverse_amount
      const fullyReversed =
        Number(previous.credited_amount) - totalReversed <= 0 &&
        prepared.reversal_due <= 0
      updated = (await referralService.updateReferralConversions({
        ...baseUpdate,
        status: fullyReversed ? "reversed" : "partially_reversed",
        reversed_amount: totalReversed,
        reversal_due: prepared.reversal_due,
      })) as unknown as ReferralConversionRecord
      const ledger = await referralService.createCommissionLedgerEntries({
        conversion_id: previous.id,
        participant_id: previous.participant_id,
        customer_id: previous.referrer_customer_id,
        order_id: previous.order_id,
        entry_type: "reversal",
        status: "posted",
        amount: -prepared.reverse_amount,
        currency_code: previous.currency_code,
        available_at: null,
        posted_at: new Date(),
        store_credit_transaction_id: input.debit_transactions?.[0]?.id || null,
        idempotency_key: `${previous.id}:reversal:${totalReversed}`,
        note: `Referral commission reversal for order #${previous.order_display_id}`,
      })
      createdLedgerId = ledger.id
    } else if (prepared.action === "record_reversal_due") {
      updated = (await referralService.updateReferralConversions({
        ...baseUpdate,
        status: "partially_reversed",
        reversal_due: prepared.reversal_due,
      })) as unknown as ReferralConversionRecord
    } else {
      updated = (await referralService.updateReferralConversions(
        baseUpdate
      )) as unknown as ReferralConversionRecord
    }

    return new StepResponse(updated, {
      conversion: previous,
      accrual,
      created_ledger_id: createdLedgerId,
    })
  },
  async (data, { container }) => {
    if (!data) {
      return
    }
    const referralService = container.resolve<ReferralModuleService>(
      REFERRAL_MODULE
    )
    if (data.created_ledger_id) {
      await referralService.deleteCommissionLedgerEntries(data.created_ledger_id)
    }
    await referralService.updateReferralConversions({
      ...data.conversion,
      eligible_amount: Number(data.conversion.eligible_amount),
      commission_amount: Number(data.conversion.commission_amount),
      credited_amount: Number(data.conversion.credited_amount),
      reversed_amount: Number(data.conversion.reversed_amount),
      reversal_due: Number(data.conversion.reversal_due),
      available_at: new Date(data.conversion.available_at),
      paid_at: data.conversion.paid_at ? new Date(data.conversion.paid_at) : null,
    })
    if (data.accrual) {
      await referralService.updateCommissionLedgerEntries({
        ...data.accrual,
        amount: Number(data.accrual.amount),
        available_at: data.accrual.available_at
          ? new Date(data.accrual.available_at)
          : null,
        posted_at: data.accrual.posted_at
          ? new Date(data.accrual.posted_at)
          : null,
      })
    }
  }
)
