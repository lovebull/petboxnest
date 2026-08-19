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

import { finalizeCashbackReconciliationStep } from "./steps/finalize-cashback-reconciliation"
import { prepareCashbackReconciliationStep } from "./steps/prepare-cashback-reconciliation"

export const reconcileCashbackWorkflow = createWorkflow(
  "reconcile-cashback",
  function (input: { entry_id: string }) {
    const prepared = prepareCashbackReconciliationStep(input)

    const accountInput = transform({ prepared }, ({ prepared }) => [
      {
        customer_id: prepared.entry.customer_id,
        currency_code: prepared.entry.currency_code,
      },
    ])

    const createdAccounts = when(
      { prepared },
      ({ prepared }) =>
        prepared.action === "release" && !prepared.account_id
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
          note: `Cashback for order #${prepared.entry.order_display_id}`,
          reference: "cashback",
          reference_id: prepared.entry.id,
        },
      ]
    )

    const creditTransactions = when(
      { prepared },
      ({ prepared }) => prepared.action === "release"
    ).then(() => creditAccountsWorkflow.runAsStep({ input: creditInput }))

    const debitInput = transform({ prepared }, ({ prepared }) => [
      {
        account_id: prepared.account_id!,
        amount: prepared.reverse_amount,
        note: `Cashback reversal for order #${prepared.entry.order_display_id}`,
        reference: "cashback_reversal",
        reference_id: prepared.entry.id,
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
    const entry = finalizeCashbackReconciliationStep(finalizeInput)

    return new WorkflowResponse(entry)
  }
)
