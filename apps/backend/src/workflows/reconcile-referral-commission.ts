import {
  createWorkflow,
  transform,
  when,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import {
  createStoreCreditAccountsWorkflow,
  creditAccountsWorkflow,
  debitAccountsWorkflow,
} from "@medusajs/loyalty-plugin/workflows"

import { finalizeReferralReconciliationStep } from "./steps/finalize-referral-reconciliation"
import { prepareReferralReconciliationStep } from "./steps/prepare-referral-reconciliation"

export const reconcileReferralCommissionWorkflow = createWorkflow(
  "reconcile-referral-commission",
  function (input: { conversion_id: string }) {
    const prepared = prepareReferralReconciliationStep(input)
    const accountInput = transform({ prepared }, ({ prepared }) => [
      {
        customer_id: prepared.conversion.referrer_customer_id,
        currency_code: prepared.conversion.currency_code,
      },
    ])
    const createdAccounts = when(
      { prepared },
      ({ prepared }) =>
        prepared.action === "release" &&
        prepared.release_amount > 0 &&
        !prepared.account_id
    ).then(() =>
      createStoreCreditAccountsWorkflow.runAsStep({ input: accountInput })
    )
    const accountId = transform(
      { prepared, createdAccounts },
      ({ prepared, createdAccounts }) =>
        prepared.account_id || createdAccounts?.[0]?.id || null
    )
    const creditInput = transform(
      { prepared, accountId },
      ({ prepared, accountId }) => [
        {
          account_id: accountId!,
          amount: prepared.release_amount,
          note: `Referral commission for order #${prepared.conversion.order_display_id}`,
          reference: "referral_commission",
          reference_id: prepared.conversion.id,
        },
      ]
    )
    const creditTransactions = when(
      { prepared },
      ({ prepared }) =>
        prepared.action === "release" && prepared.release_amount > 0
    ).then(() => creditAccountsWorkflow.runAsStep({ input: creditInput }))
    const debitInput = transform({ prepared }, ({ prepared }) => [
      {
        account_id: prepared.account_id!,
        amount: prepared.reverse_amount,
        note: `Referral commission reversal for order #${prepared.conversion.order_display_id}`,
        reference: "referral_commission_reversal",
        reference_id: prepared.conversion.id,
      },
    ])
    const debitTransactions = when(
      { prepared },
      ({ prepared }) =>
        prepared.action === "reverse" && prepared.reverse_amount > 0
    ).then(() => debitAccountsWorkflow.runAsStep({ input: debitInput }))
    const finalizeInput = transform(
      { prepared, accountId, creditTransactions, debitTransactions },
      ({ prepared, accountId, creditTransactions, debitTransactions }) => ({
        prepared,
        account_id: accountId,
        credit_transactions: creditTransactions,
        debit_transactions: debitTransactions,
      })
    )

    return new WorkflowResponse(finalizeReferralReconciliationStep(finalizeInput))
  }
)
