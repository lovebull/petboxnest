import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import { CASHBACK_MODULE } from "../modules/cashback"
import type CashbackModuleService from "../modules/cashback/service"
import type { CashbackEntryRecord } from "../modules/cashback/types"
import { reconcileCashbackWorkflow } from "../workflows/reconcile-cashback"

export default async function reconcileCashbackJob(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const cashbackService = container.resolve<CashbackModuleService>(
    CASHBACK_MODULE
  )

  try {
    const statuses = ["pending", "available", "partially_reversed"] as const
    const groups = await Promise.all(
      statuses.map((status) =>
        cashbackService.listCashbackEntries(
          { status },
          { take: 500, order: { created_at: "ASC" } }
        )
      )
    )
    const entries = groups.flat() as unknown as CashbackEntryRecord[]

    for (const entry of entries) {
      try {
        await reconcileCashbackWorkflow(container).run({
          input: { entry_id: entry.id },
        })
      } catch (error) {
        logger.error(
          `Failed to reconcile cashback ${entry.id}: ${
            error instanceof Error ? error.message : String(error)
          }`
        )
      }
    }

    logger.info(`Cashback reconciliation processed ${entries.length} entries.`)
  } catch (error) {
    logger.error(
      `Cashback reconciliation job failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}

export const config = {
  name: "reconcile-cashback-hourly",
  schedule: "0 * * * *",
}
